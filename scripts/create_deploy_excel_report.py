import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MANIFEST = ROOT / "manifest" / "deploy-package.xml"
DEPLOY_RESULT = REPORTS / "deploy-result.json"
VERIFY_RESULT = REPORTS / "post-deploy-verification.json"
OUTPUT = REPORTS / "deploy-report.xlsx"

NS = {"md": "http://soap.sforce.com/2006/04/metadata"}


def read_json(path):
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"parseError": path.read_text(encoding="utf-8", errors="replace")}


def manifest_items():
    tree = ET.parse(MANIFEST)
    rows = []
    for type_node in tree.findall("md:types", NS):
        name_node = type_node.find("md:name", NS)
        metadata_type = name_node.text if name_node is not None else ""
        for member in type_node.findall("md:members", NS):
            rows.append([metadata_type, member.text or ""])
    return rows


def deploy_summary_rows(data):
    result = data.get("result", {}) if isinstance(data, dict) else {}
    details = result.get("details", {}) if isinstance(result, dict) else {}
    return [
        ["Generated At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")],
        ["Status", result.get("status") or data.get("status") or ""],
        ["Deploy ID", result.get("id") or result.get("deployId") or ""],
        ["Check Only", str(result.get("checkOnly", ""))],
        ["Done", str(result.get("done", ""))],
        ["Success", str(result.get("success", ""))],
        ["Number Components Total", str(result.get("numberComponentsTotal", ""))],
        ["Number Components Deployed", str(result.get("numberComponentsDeployed", ""))],
        ["Number Component Errors", str(result.get("numberComponentErrors", ""))],
        ["Number Tests Total", str(result.get("numberTestsTotal", ""))],
        ["Number Test Errors", str(result.get("numberTestErrors", ""))],
        ["Component Failures Present", str(bool(details.get("componentFailures")))],
    ]


def verification_rows(data):
    result = data.get("result", {}) if isinstance(data, dict) else {}
    records = result.get("records", []) if isinstance(result, dict) else []
    if not records:
        return [["Product2.Product_Health_Status__c", "Not Found", "", ""]]
    rows = []
    for record in records:
        rows.append(
            [
                record.get("QualifiedApiName", ""),
                "Found",
                record.get("DataType", ""),
                record.get("Label", ""),
            ]
        )
    return rows


def component_failure_rows(data):
    result = data.get("result", {}) if isinstance(data, dict) else {}
    details = result.get("details", {}) if isinstance(result, dict) else {}
    failures = details.get("componentFailures", [])
    if isinstance(failures, dict):
        failures = [failures]
    rows = []
    for failure in failures:
        rows.append(
            [
                failure.get("componentType", ""),
                failure.get("fullName", ""),
                failure.get("problemType", ""),
                failure.get("problem", ""),
            ]
        )
    return rows or [["", "", "", "No component failures reported"]]


def sheet_xml(rows):
    xml_rows = []
    for row_idx, row in enumerate(rows, start=1):
        cells = []
        for col_idx, value in enumerate(row, start=1):
            ref = f"{col_name(col_idx)}{row_idx}"
            text = escape(str(value))
            cells.append(f'<c r="{ref}" t="inlineStr"><is><t>{text}</t></is></c>')
        xml_rows.append(f'<row r="{row_idx}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetData>'
        + "".join(xml_rows)
        + "</sheetData></worksheet>"
    )


def col_name(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def workbook_xml(sheet_names):
    sheets = []
    for idx, name in enumerate(sheet_names, start=1):
        sheets.append(f'<sheet name="{escape(name)}" sheetId="{idx}" r:id="rId{idx}"/>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{"".join(sheets)}</sheets></workbook>'
    )


def workbook_rels(sheet_count):
    rels = []
    for idx in range(1, sheet_count + 1):
        rels.append(
            f'<Relationship Id="rId{idx}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{idx}.xml"/>'
        )
    rels.append(
        f'<Relationship Id="rId{sheet_count + 1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(rels)
        + "</Relationships>"
    )


def content_types(sheet_count):
    overrides = [
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    for idx in range(1, sheet_count + 1):
        overrides.append(
            f'<Override PartName="/xl/worksheets/sheet{idx}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        + "".join(overrides)
        + "</Types>"
    )


def root_rels():
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )


def styles_xml():
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
        '<borders count="1"><border/></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
        "</styleSheet>"
    )


def main():
    REPORTS.mkdir(parents=True, exist_ok=True)
    deploy_data = read_json(DEPLOY_RESULT)
    verify_data = read_json(VERIFY_RESULT)
    sheets = {
        "Summary": [["Metric", "Value"], *deploy_summary_rows(deploy_data)],
        "Package Items": [["Metadata Type", "Member"], *manifest_items()],
        "Verification": [["Field", "Status", "Data Type", "Label"], *verification_rows(verify_data)],
        "Failures": [["Component Type", "Full Name", "Problem Type", "Problem"], *component_failure_rows(deploy_data)],
    }
    sheet_names = list(sheets)

    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types(len(sheet_names)))
        zf.writestr("_rels/.rels", root_rels())
        zf.writestr("xl/workbook.xml", workbook_xml(sheet_names))
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels(len(sheet_names)))
        zf.writestr("xl/styles.xml", styles_xml())
        for idx, name in enumerate(sheet_names, start=1):
            zf.writestr(f"xl/worksheets/sheet{idx}.xml", sheet_xml(sheets[name]))

    print(OUTPUT)


if __name__ == "__main__":
    main()
