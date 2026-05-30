# Salesforce Git CI/CD, Backup, Restore, and Product Health

Dokumen ini menjelaskan alur latihan Salesforce dengan GitHub Actions untuk:

- Validasi metadata Salesforce
- Backup otomatis metadata
- Backup otomatis data record
- Backup otomatis product data
- Monitoring health product
- Restore manual product data

Project ini cocok untuk latihan dengan Trailhead Playground atau Developer Edition. Untuk data production, gunakan repository private dan pertimbangkan storage backup yang lebih aman daripada public GitHub.

## 1. Tools Yang Dibutuhkan

Pastikan tools berikut sudah tersedia di laptop:

```powershell
git --version
sf --version
node --version
```

Tools utama:

- Git
- Salesforce CLI (`sf`)
- Node.js
- GitHub repository
- Salesforce org, misalnya Trailhead Playground

## 2. Login Ke Salesforce Org

Login ke Trailhead Playground atau Developer Edition:

```powershell
sf org login web --alias trailhead --instance-url https://login.salesforce.com
```

Cek org yang sudah terhubung:

```powershell
sf org list
```

Alias yang dipakai di workflow lokal adalah:

```text
trailhead
```

## 3. Membuat Project Salesforce

Buat project SFDX:

```powershell
sf project generate --name salesforce-cicd-demo
cd salesforce-cicd-demo
git init
```

Project utama berisi:

```text
force-app/
manifest/package.xml
sfdx-project.json
.github/workflows/
config/data-backup-queries.txt
```

## 4. Metadata Manifest

File manifest ada di:

```text
manifest/package.xml
```

Manifest menentukan metadata Salesforce yang dibackup, misalnya:

- CustomObject
- CustomField
- Layout
- Flow
- ApexClass
- ApexTrigger
- PermissionSet
- Profile
- CustomMetadata
- CustomTab

Retrieve metadata manual:

```powershell
sf project retrieve start --manifest manifest/package.xml --target-org trailhead
```

Commit backup awal:

```powershell
git add .
git commit -m "Initial Salesforce metadata backup"
```

## 5. Push Project Ke GitHub

Hubungkan local repository ke GitHub:

```powershell
git branch -M main
git remote add origin https://github.com/Ogifrn09/salesforce-cicd.git
git push -u origin main
```

Jika remote sudah ada:

```powershell
git remote set-url origin https://github.com/Ogifrn09/salesforce-cicd.git
git push -u origin main
```

## 6. GitHub Secret `SF_AUTH_URL`

Workflow GitHub Actions perlu login ke Salesforce. Ambil auth URL:

```powershell
sf org display --target-org trailhead --verbose
```

Copy nilai `Sfdx Auth Url` yang dimulai dari:

```text
force://...
```

Simpan ke GitHub:

```text
Repository Settings
Secrets and variables
Actions
New repository secret
```

Isi:

```text
Name: SF_AUTH_URL
Value: force://...
```

Jangan menambahkan teks `Name:` atau `Value:` di field Secret. Isi secret hanya URL `force://...`.

## 7. Workflow Validate Metadata

File:

```text
.github/workflows/salesforce-validate.yml
```

Fungsi:

- Berjalan saat Pull Request ke `main`
- Bisa dijalankan manual
- Login ke Salesforce
- Validate deploy metadata dengan `RunLocalTests`

Jalankan manual:

```text
Actions
Salesforce Validate
Run workflow
```

Jika sukses, artinya metadata di repo valid untuk dideploy ke org target.

## 8. Workflow Backup Metadata

File:

```text
.github/workflows/salesforce-backup.yml
```

Fungsi:

- Retrieve metadata dari Salesforce
- Commit otomatis jika ada perubahan metadata
- Jalan harian pada `18:00 UTC`, sekitar `01:00 WIB`
- Bisa dijalankan manual

Jalankan manual:

```text
Actions
Salesforce Metadata Backup
Run workflow
```

Jika tidak ada perubahan metadata, log akan menampilkan:

```text
No metadata changes to back up.
```

## 9. Workflow Backup Data Record

File:

```text
.github/workflows/salesforce-data-backup.yml
```

Daftar object yang dibackup ada di:

```text
config/data-backup-queries.txt
```

Format:

```text
FileName|SOQL
```

Contoh:

```text
Account|SELECT Id, Name, Type, Industry, Phone, Website, CreatedDate, LastModifiedDate FROM Account
Product2|SELECT Id, Name, ProductCode, Description, Family, IsActive, CreatedDate, LastModifiedDate FROM Product2
```

Hasil backup disimpan ke:

```text
backups/data/YYYY-MM-DD/
```

Contoh hasil:

```text
backups/data/2026-05-31/Account.csv
backups/data/2026-05-31/Product2.csv
backups/data/2026-05-31/Pricebook2.csv
backups/data/2026-05-31/PricebookEntry.csv
```

Jalankan manual:

```text
Actions
Salesforce Data Backup
Run workflow
```

## 10. Backup Product

Product backup menggunakan object:

```text
Product2
Pricebook2
PricebookEntry
```

Query ada di:

```text
config/data-backup-queries.txt
```

Urutan restore product:

```text
1. Product2
2. Pricebook2
3. PricebookEntry
```

`PricebookEntry` bergantung pada `Product2` dan `Pricebook2`, jadi restore harus dilakukan setelah kedua object tersebut tersedia.

## 11. Product Health Monitoring

File:

```text
.github/workflows/salesforce-product-health.yml
```

Fungsi monitoring:

- Active Products
- Products Missing Product Code
- Active Pricebooks
- Products Without Active Pricebook Entry

Jadwal:

```text
19:00 UTC = 02:00 WIB
```

Jalankan manual:

```text
Actions
Salesforce Product Health
Run workflow
```

Melihat output log:

```text
Actions
Salesforce Product Health
Pilih run terbaru
Klik job product-health
Buka step Check product health
```

Workflow juga membuat artifact:

```text
product-health-report
```

Melihat artifact:

```text
Actions
Salesforce Product Health
Pilih run terbaru
Summary
Artifacts
product-health-report
```

File report di dalam artifact:

```text
product-health.md
```

## 12. Restore Product Manual

File:

```text
.github/workflows/salesforce-product-restore.yml
```

Workflow ini manual dan meminta input:

```text
backup_date
```

Contoh:

```text
2026-05-31
```

Jalankan restore:

```text
Actions
Salesforce Product Restore
Run workflow
backup_date: 2026-05-31
```

Workflow akan membaca file:

```text
backups/data/2026-05-31/Product2.csv
backups/data/2026-05-31/Pricebook2.csv
backups/data/2026-05-31/PricebookEntry.csv
```

Lalu menjalankan restore:

```text
Product2
Pricebook2
PricebookEntry
```

Restore saat ini menggunakan:

```text
--external-id Id
```

Ini cocok untuk restore/update ke org yang sama. Untuk restore ke org berbeda, sebaiknya gunakan custom External ID seperti:

```text
External_Product_Id__c
```

## 13. Troubleshooting

### `git add.` error

Salah:

```powershell
git add.
```

Benar:

```powershell
git add .
```

### Push ditolak `fetch first`

Artinya GitHub punya commit baru yang belum ada di laptop.

Jalankan:

```powershell
git pull --rebase origin main
git push
```

### Secret salah format

`SF_AUTH_URL` harus hanya berisi:

```text
force://...
```

Tidak boleh berisi:

```text
Name: SF_AUTH_URL
Value: force://...
```

Pastikan domain Salesforce tidak terpotong atau mengandung spasi.

### Validate error `NoTestRun`

Untuk `sf project deploy validate`, gunakan test level valid seperti:

```text
RunLocalTests
```

### Product health artifact tidak kelihatan

Artifact ada di halaman `Summary`, bukan di halaman detail job.

Path:

```text
Actions
Salesforce Product Health
Pilih run
Summary
Artifacts
```

## 14. Catatan Keamanan

Repository public tidak cocok untuk backup data production karena CSV bisa berisi data sensitif.

Untuk production:

- Gunakan private repository
- Batasi object dan field yang dibackup
- Jangan simpan data pribadi yang tidak perlu
- Gunakan GitHub secret dengan hati-hati
- Rotate `SF_AUTH_URL` jika pernah terlihat di screenshot atau log
- Pertimbangkan backup data ke secure storage, bukan commit ke public GitHub

## 15. Command Git Harian

Cek status:

```powershell
git status
```

Commit perubahan:

```powershell
git add .
git commit -m "Your commit message"
```

Ambil update dari GitHub:

```powershell
git pull --rebase origin main
```

Push ke GitHub:

```powershell
git push
```
