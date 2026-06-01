import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
OUTPUT = REPORTS / "platform-health-report.xlsx"


def read_json(name):
    path = REPORTS / name
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"parseError": path.read_text(encoding="utf-8", errors="replace")}


def records(name):
    data = read_json(name)
    result = data.get("result", {}) if isinstance(data, dict) else {}
    rows = result.get("records", []) if isinstance(result, dict) else []
    return rows if isinstance(rows, list) else []


def limit_rows():
    data = read_json("org-limits.json")
    result = data.get("result", []) if isinstance(data, dict) else []
    rows = [["Limit Name", "Max", "Remaining", "Used", "Used %", "Status"]]
    if isinstance(result, dict):
        result = [{"name": k, **v} for k, v in result.items() if isinstance(v, dict)]
    for item in result:
        max_value = item.get("max", "")
        remaining = item.get("remaining", "")
        used = ""
        used_pct = ""
        status = "UNKNOWN"
        if isinstance(max_value, int) and isinstance(remaining, int) and max_value > 0:
            used = max_value - remaining
            used_pct_value = used / max_value
            used_pct = f"{used_pct_value:.1%}"
            status = "RED" if remaining / max_value < 0.10 else "YELLOW" if remaining / max_value < 0.20 else "GREEN"
        rows.append([item.get("name", ""), max_value, remaining, used, used_pct, status])
    return rows if len(rows) > 1 else rows + [["No limit data found", "", "", "", "", "UNKNOWN"]]


def generic_rows(title, field_names, source_name):
    rows = [field_names]
    for record in records(source_name):
        rows.append([flatten(record.get(field, "")) for field in field_names])
    if len(rows) == 1:
        rows.append([f"No {title} found"] + [""] * (len(field_names) - 1))
    return rows


def flatten(value):
    if isinstance(value, dict):
        if "Name" in value:
            return value["Name"]
        return json.dumps(value, ensure_ascii=False)
    return value


def summary_rows():
    apex_failures = len(records("async-apex-failures.json"))
    test_failures = len(records("apex-test-failures.json"))
    login_failures = len(records("login-failures.json"))
    product_missing_code = len(records("products-missing-code.json"))
    opportunity_past_close = len(records("opportunities-past-close.json"))
    critical_count = apex_failures + test_failures
    warning_count = login_failures + product_missing_code + opportunity_past_close
    overall = "RED" if critical_count else "YELLOW" if warning_count else "GREEN"
    return [
        ["Metric", "Value"],
        ["Generated At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")],
        ["Target Org", "dummy prod"],
        ["Overall Status", overall],
        ["Critical Count", critical_count],
        ["Warning Count", warning_count],
        ["Async Apex Failures", apex_failures],
        ["Apex Test Failures", test_failures],
        ["Login Failures", login_failures],
        ["Products Missing Code", product_missing_code],
        ["Open Opportunities Past Close Date", opportunity_past_close],
    ]


def recommendations_rows():
    rows = [["Area", "Recommendation"]]
    if len(records("async-apex-failures.json")):
        rows.append(["Async Apex", "Review failed AsyncApexJob records and rerun or fix failing Apex logic."])
    if len(records("apex-test-failures.json")):
        rows.append(["Apex Tests", "Fix failing tests before production deployment or release approval."])
    if len(records("login-failures.json")):
        rows.append(["Security", "Review failed login history for suspicious access or user training issues."])
    if len(records("products-missing-code.json")):
        rows.append(["Product Data", "Fill ProductCode for active products or mark invalid products inactive."])
    if len(records("opportunities-past-close.json")):
        rows.append(["Opportunity Data", "Update close dates or close stale open opportunities."])
    if len(rows) == 1:
        rows.append(["General", "No critical recommendations. Continue scheduled monitoring."])
    return rows


def col_name(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


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
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
        + "".join(xml_rows)
        + "</sheetData></worksheet>"
    )


def workbook_xml(sheet_names):
    sheets = "".join(
        f'<sheet name="{escape(name)}" sheetId="{idx}" r:id="rId{idx}"/>'
        for idx, name in enumerate(sheet_names, start=1)
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<sheets>{sheets}</sheets></workbook>"
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
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
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
    sheets = {
        "Summary": summary_rows(),
        "Org Limits": limit_rows(),
        "Async Apex Failures": generic_rows("Async Apex failures", ["Id", "Status", "JobType", "NumberOfErrors", "CreatedDate", "CompletedDate"], "async-apex-failures.json"),
        "Apex Test Failures": generic_rows("Apex test failures", ["Id", "MethodName", "Outcome", "Message", "RunTime"], "apex-test-failures.json"),
        "Login Failures": generic_rows("login failures", ["Id", "LoginTime", "Status", "SourceIp", "Browser", "Platform"], "login-failures.json"),
        "Data Quality": [
            ["Check", "Record Id", "Name", "Detail"],
            *[["Product Missing Code", r.get("Id", ""), r.get("Name", ""), r.get("ProductCode", "")] for r in records("products-missing-code.json")],
            *[["Opportunity Past Close", r.get("Id", ""), r.get("Name", ""), r.get("CloseDate", "")] for r in records("opportunities-past-close.json")],
        ],
        "Recommendations": recommendations_rows(),
    }
    if len(sheets["Data Quality"]) == 1:
        sheets["Data Quality"].append(["No data quality issues found", "", "", ""])

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
