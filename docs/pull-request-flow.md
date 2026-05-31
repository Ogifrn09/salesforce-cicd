# Pull Request Flow for Salesforce CI/CD

Dokumen ini dipakai untuk test alur enhancement dari dummy dev ke dummy prod lewat Pull Request.

## Org Mapping

```text
Dummy Dev  : ShankaraOrg
Dummy Prod : trailhead
```

GitHub Secrets:

```text
SF_DEV_AUTH_URL  -> ShankaraOrg
SF_PROD_AUTH_URL -> trailhead
```

## Flow Utama

```text
feature branch
-> pull request to main
-> Salesforce Validate otomatis
-> merge to main
-> backup dummy prod
-> deploy manual to dummy prod
-> download deploy report
```

## 1. Pastikan Main Bersih

```powershell
git checkout main
git pull --rebase origin main
git status
```

Expected:

```text
nothing to commit, working tree clean
```

## 2. Buat Branch Feature

```powershell
git checkout -b feature/test-pr-validate
```

## 3. Buat Perubahan Kecil Untuk Test

Untuk test pertama, cukup ubah dokumentasi agar aman:

```powershell
notepad docs/pull-request-flow.md
```

Tambahkan catatan kecil, save, lalu cek:

```powershell
git status
git diff
```

## 4. Commit Dan Push Branch

```powershell
git add docs/pull-request-flow.md
git commit -m "Test pull request validate flow"
git push -u origin feature/test-pr-validate
```

## 5. Buat Pull Request

Di GitHub:

```text
Repository
Pull requests
New pull request
base: main
compare: feature/test-pr-validate
Create pull request
```

Karena `.github/workflows/salesforce-validate.yml` punya trigger:

```yaml
on:
  pull_request:
    branches:
      - main
```

maka workflow `Salesforce Validate` otomatis jalan.

## 6. Review Hasil Validate

Jika hijau:

```text
Merge pull request
```

Jika merah:

```text
Jangan merge dulu.
Klik detail workflow.
Perbaiki error.
Commit dan push ulang ke branch yang sama.
```

## 7. Setelah Merge Ke Main

Jalankan safety checks untuk dummy prod:

```text
Actions
Salesforce Metadata Backup
Run workflow
```

```text
Actions
Salesforce Data Backup
Run workflow
```

```text
Actions
Salesforce Product Health
Run workflow
```

Known issue product health boleh dicatat jika sedang latihan data error.

## 8. Deploy Ke Dummy Prod

```text
Actions
Salesforce Manual Deploy
Run workflow
confirm_deploy: DEPLOY
```

Setelah selesai, download artifact:

```text
Summary
Artifacts
deploy-report
```

Isi artifact:

```text
deploy-report.md
deploy-result.json
post-deploy-verification.json
deploy-report.xlsx
```

## Catatan Penting

- Jangan commit metadata retrieve besar dari org yang beda package jika tidak perlu.
- Untuk enhancement kecil, retrieve metadata spesifik dengan `--metadata`.
- `manifest/deploy-package.xml` sebaiknya hanya berisi metadata yang akan dideploy.
- Branch `main` adalah branch stabil.
- Branch `feature/*` adalah tempat eksperimen.
