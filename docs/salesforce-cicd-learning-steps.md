# Salesforce CI/CD Learning Steps

Panduan ini merangkum latihan Salesforce CI/CD dari awal sampai rollback menggunakan Git, GitHub Actions, dummy dev, dummy prod, backup, deploy report, dan restore manual.

## 1. Tujuan Latihan

Tujuan latihan ini adalah memahami alur dasar CI/CD Salesforce:

- Membuat perubahan metadata di dummy dev
- Menyimpan perubahan ke Git
- Membuat Pull Request
- Menjalankan validate otomatis
- Melakukan backup dummy prod sebelum deploy
- Deploy manual ke dummy prod
- Verifikasi hasil deploy
- Membuat deploy report
- Rollback metadata
- Restore data secara manual jika diperlukan

## 2. Tools Yang Dipakai

Tools utama:

- Git
- Salesforce CLI (`sf`)
- Node.js
- GitHub repository
- GitHub Actions
- Trailhead Playground / Developer Edition

Cek tools:

```powershell
git --version
sf --version
node --version
```

## 3. Org Mapping

Dalam latihan ini ada 2 org utama:

```text
Dummy Dev  : ShankaraOrg
Dummy Prod : trailhead
```

Detail:

```text
Dummy Dev Alias  : ShankaraOrg
Dummy Prod Alias : trailhead
```

Secret GitHub:

```text
SF_DEV_AUTH_URL  -> ShankaraOrg
SF_PROD_AUTH_URL -> trailhead
```

`SF_AUTH_URL` lama boleh dibiarkan sementara, tetapi workflow utama sudah diarahkan ke secret baru.

## 4. Login Salesforce Org

Login dummy dev:

```powershell
sf org login web --alias ShankaraOrg --instance-url https://login.salesforce.com
```

Login dummy prod:

```powershell
sf org login web --alias trailhead --instance-url https://login.salesforce.com
```

Cek org:

```powershell
sf org list
```

## 5. Membuat Project Salesforce

Buat project:

```powershell
sf project generate --name salesforce-cicd-demo
cd salesforce-cicd-demo
git init
```

Struktur penting:

```text
force-app/
manifest/package.xml
manifest/deploy-package.xml
.github/workflows/
config/data-backup-queries.txt
docs/
```

## 6. Repository GitHub

Remote GitHub:

```text
https://github.com/Ogifrn09/salesforce-cicd.git
```

Setup remote:

```powershell
git branch -M main
git remote add origin https://github.com/Ogifrn09/salesforce-cicd.git
git push -u origin main
```

Jika remote sudah ada:

```powershell
git remote set-url origin https://github.com/Ogifrn09/salesforce-cicd.git
```

## 7. GitHub Secrets

Buat 2 secret:

```text
SF_DEV_AUTH_URL
SF_PROD_AUTH_URL
```

Ambil auth URL dev:

```powershell
sf org display --target-org ShankaraOrg --verbose
```

Ambil auth URL prod:

```powershell
sf org display --target-org trailhead --verbose
```

Di GitHub:

```text
Settings
Secrets and variables
Actions
New repository secret
```

Isi secret hanya value yang dimulai dari:

```text
force://...
```

## 8. Manifest Backup dan Deploy

`manifest/package.xml` digunakan untuk backup metadata yang lebih luas.

`manifest/deploy-package.xml` digunakan untuk deploy metadata yang dipilih saja.

Contoh deploy package:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Product2.Product_Health_Status__c</members>
        <members>Product2.Deployment_Batch__c</members>
        <members>Product2.Product_Release_Notes__c</members>
        <members>Account.CustomerPriority__c</members>
        <name>CustomField</name>
    </types>
    <version>60.0</version>
</Package>
```

Catatan penting:

```text
Metadata yang masuk deploy-package.xml = metadata yang ikut validate/deploy.
```

Jika field tidak masuk manifest, field tidak akan dideploy walaupun file metadata ada di repo.

## 9. Backup Metadata

Workflow:

```text
Salesforce Metadata Backup
```

File:

```text
.github/workflows/salesforce-backup.yml
```

Target:

```text
SF_PROD_AUTH_URL -> dummy prod
```

Jalankan manual:

```text
Actions
Salesforce Metadata Backup
Run workflow
```

## 10. Backup Data

Workflow:

```text
Salesforce Data Backup
```

File:

```text
.github/workflows/salesforce-data-backup.yml
```

Query config:

```text
config/data-backup-queries.txt
```

Object yang dibackup:

```text
Account
Contact
Opportunity
Quote
Order
Contract
Asset
Product2
Pricebook2
PricebookEntry
```

Hasil backup:

```text
backups/data/YYYY-MM-DD/
```

Contoh:

```text
backups/data/2026-05-31/Product2.csv
backups/data/2026-05-31/Order.csv
backups/data/2026-05-31/Quote.csv
```

## 11. Product Health Monitoring

Workflow:

```text
Salesforce Product Health
```

Fungsi:

- Cek active product
- Cek product tanpa product code
- Cek active pricebook
- Cek product tanpa active pricebook entry

Jika rule gagal, workflow merah.

Artifact:

```text
product-health-report
```

## 12. Flow Pull Request

Alur yang dipakai:

```text
feature branch
-> Pull Request ke main
-> Salesforce Validate otomatis
-> Merge ke main
-> Backup prod
-> Manual deploy ke dummy prod
```

Mulai dari main:

```powershell
git checkout main
git pull --rebase origin main
git status
```

Buat branch:

```powershell
git checkout -b feature/add-product-account-fields
```

Push branch:

```powershell
git push -u origin feature/add-product-account-fields
```

Buat PR di GitHub:

```text
Pull requests
New pull request
base: main
compare: feature/add-product-account-fields
Create pull request
```

Jika validate hijau:

```text
Merge pull request
```

## 13. Simulasi Field Product

Contoh field:

```text
Object    : Product2
Field     : Product Release Notes
API Name  : Product_Release_Notes__c
Type      : Long Text Area
```

Buat field di dummy dev lewat UI:

```text
Setup
Object Manager
Product
Fields & Relationships
New
Long Text Area
```

Retrieve field:

```powershell
sf project retrieve start --metadata CustomField:Product2.Product_Release_Notes__c --target-org ShankaraOrg
```

Tambahkan ke deploy manifest:

```xml
<members>Product2.Product_Release_Notes__c</members>
```

Commit:

```powershell
git add force-app/main/default/objects/Product2/fields/Product_Release_Notes__c.field-meta.xml manifest/deploy-package.xml
git commit -m "Add product release notes field"
```

## 14. Simulasi Field Account

Contoh field:

```text
Object    : Account
Field     : Customer Priority
Type      : Picklist
Values    : High, Medium, Low
```

Catatan penting: API name yang benar harus dicek dari Salesforce. Dalam latihan ini field yang muncul adalah:

```text
CustomerPriority__c
```

bukan:

```text
Customer_Priority__c
```

Cek field di dev:

```powershell
sf data query --target-org ShankaraOrg --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Account' AND QualifiedApiName LIKE '%Priority%'"
```

Manifest harus memakai API name yang benar:

```xml
<members>Account.CustomerPriority__c</members>
```

## 15. Validate Otomatis

Workflow:

```text
Salesforce Validate
```

File:

```text
.github/workflows/salesforce-validate.yml
```

Target:

```text
SF_DEV_AUTH_URL -> ShankaraOrg
```

Command:

```bash
sf project deploy start \
  --dry-run \
  --manifest manifest/deploy-package.xml \
  --target-org ci-org \
  --test-level NoTestRun
```

Validate otomatis jalan saat Pull Request ke `main`.

## 16. Manual Deploy ke Dummy Prod

Workflow:

```text
Salesforce Manual Deploy
```

Target:

```text
SF_PROD_AUTH_URL -> trailhead
```

Jalankan:

```text
Actions
Salesforce Manual Deploy
Run workflow
Branch: main
confirm_deploy: DEPLOY
```

Pastikan branch yang dipilih adalah:

```text
main
```

Jika branch salah, deploy bisa memakai commit lama dan field tidak muncul di dummy prod.

## 17. Deploy Report

Artifact:

```text
deploy-report
```

Isi artifact:

```text
deploy-report.md
deploy-result.json
post-deploy-verification.json
deploy-report.xlsx
```

Di Excel, cek sheet:

```text
Summary
Package Items
Verification
Failures
```

Sheet `Package Items` menampilkan metadata yang dikirim saat deploy.

## 18. Verifikasi Field di Dummy Prod

Cek product field:

```powershell
sf data query --target-org trailhead --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Product2' AND QualifiedApiName LIKE '%Release%'"
```

Cek account field:

```powershell
sf data query --target-org trailhead --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Account' AND QualifiedApiName LIKE '%Priority%'"
```

Jika hasil query `0`, cek:

- Apakah field sudah merge ke `main`
- Apakah workflow deploy dijalankan dari branch `main`
- Apakah field masuk `manifest/deploy-package.xml`
- Apakah API name benar
- Apakah deploy report menunjukkan success

## 19. Rollback Metadata

Rollback metadata menggunakan destructive changes.

File:

```text
manifest/destructiveChanges.xml
manifest/package-empty.xml
.github/workflows/salesforce-rollback.yml
```

Contoh rollback 2 field:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Product2.Product_Release_Notes__c</members>
        <members>Account.CustomerPriority__c</members>
        <name>CustomField</name>
    </types>
    <version>60.0</version>
</Package>
```

Jalankan:

```text
Actions
Salesforce Manual Rollback
Run workflow
confirm_rollback: ROLLBACK
```

Rollback menghapus metadata yang tertulis di `destructiveChanges.xml`.

Jika ada 2 field di file itu, 2 field akan hilang dari dummy prod.

## 20. Data Restore Manual

Workflow:

```text
Salesforce Manual Data Restore
```

Input:

```text
backup_date
sobject_name
csv_file
external_id
confirm_restore
```

Contoh restore Product2:

```text
backup_date: 2026-05-31
sobject_name: Product2
csv_file: Product2.csv
external_id: Id
confirm_restore: RESTORE
```

Data restore dijalankan manual per object.

Urutan restore yang aman:

```text
1. Account
2. Contact
3. Opportunity
4. Product2
5. Pricebook2
6. PricebookEntry
7. Quote
8. Order
9. Contract
10. Asset
```

## 21. Perbedaan Metadata Rollback dan Data Restore

Metadata rollback:

```text
Menghapus atau mengembalikan struktur metadata seperti field, object, layout, flow.
```

Data restore:

```text
Mengembalikan record dari CSV backup.
```

Rollback metadata tidak otomatis restore data.

Jika field dihapus, data di field itu juga bisa hilang.

## 22. Kesalahan Yang Pernah Terjadi

### Field Ada di Branch Feature Tapi Belum Ada di Main

Gejala:

```text
Deploy dari main berhasil, tapi field tidak muncul di prod.
```

Penyebab:

```text
Field masih ada di branch feature, belum merge ke main.
```

Solusi:

```text
Buat PR, validate, merge ke main, lalu deploy dari branch main.
```

### Field Tidak Masuk Manifest

Gejala:

```text
File metadata ada, tapi field tidak muncul setelah deploy.
```

Penyebab:

```text
Field belum ditulis di manifest/deploy-package.xml.
```

Solusi:

```text
Tambahkan <members>Object.Field__c</members> ke deploy-package.xml.
```

### API Name Salah

Gejala:

```text
Query Customer_Priority__c hasilnya 0, tapi UI menunjukkan Customer Priority.
```

Penyebab:

```text
API name sebenarnya CustomerPriority__c.
```

Solusi:

```powershell
sf data query --target-org trailhead --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Account' AND QualifiedApiName LIKE '%Priority%'"
```

Gunakan API name yang muncul dari Salesforce.

### Health Check Merah

Product health bisa merah karena:

```text
ProductCode kosong
Tidak ada active PricebookEntry
```

Untuk latihan boleh dicatat sebagai known issue.

Untuk production real, sebaiknya diselesaikan sebelum deploy.

## 23. Checklist Sebelum Deploy

Sebelum deploy:

- Pull Request sudah merge ke `main`
- Workflow validate hijau
- `manifest/deploy-package.xml` berisi metadata yang benar
- Backup metadata sudah dijalankan
- Backup data sudah dijalankan
- Product health dicek atau known issue dicatat
- Deploy dijalankan dari branch `main`
- `confirm_deploy` diisi `DEPLOY`

## 24. Checklist Setelah Deploy

Setelah deploy:

- Download `deploy-report`
- Cek `deploy-report.xlsx`
- Cek sheet `Package Items`
- Cek sheet `Summary`
- Cek sheet `Failures`
- Query field di dummy prod
- Cek field di Object Manager UI

## 25. Checklist Rollback

Sebelum rollback:

- Pastikan metadata yang mau dihapus benar
- Update `manifest/destructiveChanges.xml`
- Jangan hapus metadata lama yang bukan bagian deployment
- Jalankan rollback manual
- Download rollback report
- Query ulang metadata

Setelah rollback:

```text
Query field harus return 0 record jika field berhasil dihapus.
```

## 26. Salesforce Org Health Monitoring

Workflow:

```text
Salesforce Org Health
```

File:

```text
.github/workflows/salesforce-org-health.yml
```

Target:

```text
SF_PROD_AUTH_URL -> dummy prod
```

Tujuan:

```text
Memberikan laporan health org Salesforce secara terjadwal dan manual.
```

Area yang dicek:

- Org Limits
- Product Health
- Opportunity Health
- Quote Health
- Order Health
- Asset Health
- Field Verification

Artifact:

```text
org-health-report
```

Isi artifact:

```text
org-health-report.md
org-limits.json
org-health-report.xlsx
```

Sheet Excel:

```text
Summary
Org Limits
Health Report
```

Cara menjalankan manual:

```text
Actions
Salesforce Org Health
Run workflow
Branch: main
```

Cara membaca `Org Limits`:

```text
Limit Name  = nama limit Salesforce
Max         = batas maksimal
Remaining   = sisa limit
```

Contoh:

```text
DailyApiRequests
Max: 15000
Remaining: 14661
```

Artinya API request harian masih tersisa 14.661 dari 15.000.

## 27. Salesforce Platform Health Connector

Workflow:

```text
Salesforce Platform Health Connector
```

File:

```text
.github/workflows/salesforce-platform-health.yml
scripts/create_platform_health_excel_report.py
```

Target:

```text
SF_PROD_AUTH_URL -> dummy prod
```

Jadwal:

```text
Setiap hari jam 01:00 WIB
```

Cron GitHub:

```yaml
schedule:
  - cron: "0 18 * * *"
```

Catatan:

```text
GitHub Actions memakai UTC.
01:00 WIB = 18:00 UTC hari sebelumnya.
```

Tujuan connector:

```text
Observe Salesforce platform health & performance secara terjadwal.
```

Area yang dicek:

- Org limits
- API usage / remaining limit
- Async Apex failures
- Apex test failures
- Login failures
- Product missing code
- Open Opportunity lewat CloseDate
- Recommendations

Artifact:

```text
platform-health-report
```

Isi artifact:

```text
platform-health-report.md
platform-health-report.xlsx
org-limits.json
async-apex-failures.json
apex-test-failures.json
login-failures.json
products-missing-code.json
opportunities-past-close.json
```

Sheet Excel:

```text
Summary
Org Limits
Async Apex Failures
Apex Test Failures
Login Failures
Data Quality
Recommendations
```

Cara menjalankan manual:

```text
Actions
Salesforce Platform Health Connector
Run workflow
Branch: main
```

Cara membaca status:

```text
GREEN  = tidak ada critical issue
YELLOW = ada warning data quality atau login failure
RED    = ada critical issue seperti Apex failure atau test failure
```

Contoh issue yang perlu diperhatikan:

```text
DailyApiRequests remaining rendah
Async Apex job failed
Apex test failure
Failed login meningkat
Product aktif tanpa ProductCode
Opportunity masih open tapi CloseDate sudah lewat
```

## 28. Mapping ke Observability dan Backup Recovery

Solusi yang sudah dibuat bisa dipakai sebagai MVP connector untuk:

```text
Test konektor Salesforce buat observe platform health & performance.
```

Alur connector:

```text
GitHub Actions Scheduler
-> Salesforce CLI
-> SF_PROD_AUTH_URL
-> Query health/performance signals
-> Generate Markdown, JSON, dan Excel report
-> Upload artifact sebagai evidence
```

Mapping ke kebutuhan observability:

```text
API limit monitoring        -> Org Limits
Apex performance/failure    -> Async Apex Failures
Testing health              -> Apex Test Failures
Security signal             -> Login Failures
Data quality                -> Product dan Opportunity checks
Audit evidence              -> Excel, Markdown, JSON artifacts
Scheduled monitoring        -> Daily 01:00 WIB
```

Mapping ke Backup & Recovery Maturity:

```text
Backup metadata             -> Salesforce Metadata Backup
Backup data                 -> Salesforce Data Backup
Pre-deploy validation       -> Salesforce Validate
Controlled deployment       -> Salesforce Manual Deploy
Deploy evidence             -> deploy-report.xlsx
Health monitoring           -> Org Health dan Platform Health Connector
Rollback metadata           -> Salesforce Manual Rollback
Data restore                -> Salesforce Manual Data Restore
RPO/RTO simulation          -> deploy, verify, rollback, restore drill
```

## 29. Production Enhancement Ideas

Untuk production sungguhan, solusi ini bisa diperkuat dengan:

- Private repository
- Dedicated Salesforce integration user
- Secret rotation policy
- Approval sebelum deploy production
- Alert ke Slack, Email, atau Microsoft Teams
- Retention policy untuk artifact backup dan report
- Backup data ke secure storage
- Multi-org monitoring
- Event Monitoring integration
- Threshold RED/YELLOW/GREEN yang disepakati bisnis
- Recovery drill berkala untuk menguji RPO dan RTO

## 30. Kesimpulan

Alur latihan yang sudah dibangun:

```text
Dummy Dev
-> Git feature branch
-> Pull Request
-> Validate otomatis
-> Merge main
-> Backup dummy prod
-> Manual deploy
-> Deploy report Excel
-> Verify prod
-> Org Health Monitoring
-> Platform Health Connector
-> Rollback metadata
-> Manual data restore jika diperlukan
```

Ini adalah pola dasar CI/CD Salesforce yang aman untuk latihan dan bisa dikembangkan untuk sandbox/production sungguhan.
