# Email Service Platform (ESP) - Admin & Management System

A comprehensive PHP-based Email Service Platform with admin dashboard, bounce processing, complaint handling, and advanced IMAP integration for email management.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Modules](#modules)
- [Database](#database)
- [API & Integration](#api--integration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project is a complete Email Service Platform (ESP) built with PHP that provides:
- Admin dashboard for email campaign management
- Bounce and complaint processing systems
- SMTP sending capabilities
- Data management and reporting
- User authentication and role-based access control
- Email offer portal
- Advanced IMAP integration for inbox management

## 📁 Project Structure

```
/var/www/html/
├── admin/                          # Admin dashboard and core management
│   ├── index.php                   # Main dashboard
│   ├── login.php                   # Authentication page
│   ├── dashboard.php               # Dashboard interface
│   ├── autheticate.php             # Authentication logic
│   ├── addoffer.php                # Offer management
│   ├── offer_add_action.php        # Offer action handler
│   ├── data.php                    # Data management
│   ├── account_page.php            # Account settings
│   ├── include.php                 # Admin configuration & includes
│   ├── template.php                # Email templates
│   ├── ip_hourly_report.php        # IP hourly reports
│   ├── ip_offer_report.php         # Offer reports
│   ├── sending_report.php          # Sending statistics
│   ├── openreport.php              # Open rate reports
│   ├── openreport2.php             # Alternative open reports
│   ├── dashboard/                  # Dashboard assets
│   ├── logo/                       # Logo assets
│   ├── members/                    # Member management
│   └── temp/                       # Temporary files
│
├── advance_imap/                   # Advanced IMAP integration
│   ├── inbox.php                   # IMAP inbox viewer
│   ├── spam.php                    # Spam folder handler
│   ├── include.php                 # IMAP configurations
│   └── [email accounts]/           # Email account specific files
│
├── bounce_processor/               # Bounce email processor
│   ├── index.php                   # Bounce processor main
│   └── get_data.php                # Fetch bounce data
│
├── complain_processor/             # Complaint/DNSBL processor
│   ├── autoComplainFetcher.php     # Auto complaint fetching
│   ├── fetchComplainImap.php       # Fetch via IMAP
│   ├── fetchEmailForEdit.php       # Email editing
│   ├── store_action.php            # Store complaint action
│   ├── testConnection.php          # Connection testing
│   ├── sentora_complainer.sql      # Database schema
│   └── fetched_complains/          # Complaint data storage
│
├── Data_Download/                  # Data export & management
│   ├── index.php                   # Data download interface
│   ├── datacount.php               # Count data records
│   ├── data_upload_action.php      # Upload data handler
│   ├── bounce_update.php           # Bounce data updates
│   ├── complain_update.php         # Complaint data updates
│   ├── insert_data_action_scheduler.php  # Scheduled data insertion
│   ├── db_schema.sql               # Database schema
│   └── datatable.css               # Data table styling
│
├── Data_download_module/           # Alternative download module
│   └── get_files.php               # Get files for download
│
├── ESP_Module_fsock/               # Socket-based ESP module
│
├── ESP_Module_fsock_send_smtp/     # SMTP sending via socket
│
├── ESP_Module_fsock_send_smtp_auto/ # Automated SMTP sending
│
├── smtp/                           # SMTP testing/utilities
│
├── smtp_tester/                    # SMTP connection tester
│
├── suppression/                    # Suppression list management
│
├── Offer_portal/                   # Public offer portal
│
├── image_portal/                   # Image hosting/management
│
├── interface/                      # Legacy interface files
│
├── interface_new/                  # New interface files
│
├── screenout/                      # Screen output utilities
│
├── server_setup/                   # Server setup scripts
│
├── all_tar/                        # Backup archives
│   └── DB_back/                    # Database backups
│       └── DB_schema_back/         # Schema backups
│
├── index.php                       # Root index (redirects to admin login)
├── screen.php                      # Screen management
├── server_ip.php                   # Server IP configuration
├── show_db_process.php             # Database process viewer
├── BACKUP_RECOVERY.sh              # Backup recovery script
└── README.md                       # This file
```

## ✨ Features

### Admin Panel
- **User Authentication**: Secure login with session management
- **Dashboard**: Overview of sending statistics and metrics
- **Role-Based Access Control**: Different permission levels for users
- **Email Campaign Management**: Create and manage email offers
- **IP Management**: View and manage sending IPs
- **Reporting**: Detailed reports on sends, opens, bounces, and complaints

### Bounce Processing
- Automated bounce email detection and processing
- Bounce data collection and analysis
- Integration with bounce handlers

### Complaint Processing (DNSBL)
- Automated complaint/DNSBL fetching
- IMAP integration for complaint emails
- Complaint data storage and management
- DNS-based blacklist integration

### Advanced IMAP
- Multi-account IMAP support
- Inbox and spam folder management
- Email account integration
- Real-time email monitoring

### Data Management
- Import/export data functionality
- Bounce and complaint data updates
- Suppression list management
- Scheduled data insertion
- Database schema management

### Reporting
- Hourly IP reports
- Offer performance reports
- Sending statistics
- Open rate tracking
- Complaint reports

## 🔧 System Requirements

- **PHP**: 5.x or higher
- **Web Server**: Apache with mod_rewrite
- **Database**: MySQL (version 5.x+)
- **Extensions**: 
  - MySQL/MySQLi
  - IMAP (for advance_imap module)
  - cURL (for API calls)
  - SPL/Reflection
- **OS**: Linux-based (CentOS, Ubuntu, etc.)

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Karan06/email-service-platform-ankit-anand.git /var/www/html
   cd /var/www/html
   ```

2. **Set proper permissions**:
   ```bash
   chmod -R 755 /var/www/htmlREADME.md
   chmod -R 777 /var/www/html/admin/temp
   chmod -R 777 /var/www/html/complain_processor/fetched_complains
   chmod -R 777 /var/www/html/all_tar/DB_back
   ```

3. **Configure the database**:
   - Import the database schema from `Data_Download/db_schema.sql` or `complain_processor/sentora_complainer.sql`
   - Update database credentials in respective `include.php` files

4. **Setup cron jobs**:
   - Configure bounce processor to run periodically
   - Setup complaint fetcher cron job (see `complain_processor/crontab.txt`)
   - Schedule data insertion tasks

## ⚙️ Configuration

### Admin Configuration (`admin/include.php`)
- Database connections (MySQL, RDS)
- SMTP settings
- Server IP lists
- Role mappings

### IMAP Configuration (`advance_imap/include.php`)
- Email account credentials
- IMAP server settings
- Folder mappings

### Complaint Processor (`complain_processor/include.php`)
- Database credentials
- DNSBL settings
- Email notification settings


```

## 🔌 Modules

### 1. Admin Module (`/admin`)
Core administration dashboard with authentication, offer management, and reporting.

### 2. Bounce Processor (`/bounce_processor`)
Processes bounce-back emails and maintains bounce lists.

### 3. Complaint Processor (`/complain_processor`)
Handles complaint emails and DNSBL integration.

### 4. Advanced IMAP (`/advance_imap`)
Multi-account IMAP integration for email monitoring.

### 5. Data Download (`/Data_Download`)
Bulk data export, import, and management utilities.

### 6. ESP SMTP Modules
- `ESP_Module_fsock/`: Socket-based email sending
- `ESP_Module_fsock_send_smtp/`: SMTP protocol implementation
- `ESP_Module_fsock_send_smtp_auto/`: Automated sending

### 7. Suppression Management (`/suppression`)
Suppression list handling and management.

## 💾 Database

### Main Tables
- `login.role_mapped`: Role-to-employee mappings
- `admin.sending_ip_list`: Sending IP addresses
- `admin.templates`: Email templates
- `admin.offers`: Email offers/campaigns
- `admin.bounce_data`: Bounce records
- `admin.complaint_data`: Complaint records

### Database Files
- `Data_Download/db_schema.sql`: Main schema
- `complain_processor/sentora_complainer.sql`: Complaint schema
- `all_tar/DB_back/`: Backup archives

## 🔗 API & Integration

### Authentication API
- **Endpoint**: `admin/autheticate.php`
- **Method**: GET
- **Parameters**: `username`, `password` (base64 encoded)
- **Response**: Pipe-separated credentials or error

### Server IP API
- **Endpoint**: `server_ip.php`
- **Method**: GET
- **Returns**: Server IP configuration

### Database Processes
- **Endpoint**: `show_db_process.php`
- **Returns**: Active database processes

## 🚀 Usage

### Admin Login
1. Navigate to `http://your-domain/admin/login.php`
2. Enter credentials
3. Access dashboard

### Create Email Campaign
1. Go to Admin → Offers
2. Click "Add Offer"
3. Configure email details
4. Set sending IP
5. Submit for approval

### Monitor Bounces
1. Go to Data Download
2. View bounce reports
3. Update bounce data
4. Download for analysis

### Check Complaints
1. Navigate to Complaint Processor
2. View fetched complaints
3. Take action on complaints
4. Monitor DNSBL status

## 🐛 Troubleshooting

### Database Connection Issues
- Verify credentials in `admin/include.php`
- Check MySQL server status
- Ensure user has necessary privileges

### IMAP Connection Fails
- Verify email credentials in `advance_imap/include.php`
- Check IMAP server settings
- Ensure PHP IMAP extension is installed: `php -m | grep imap`

### Permission Denied Errors
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
chmod 777 /var/www/html/admin/temp
```

### Session Issues
- Clear browser cookies
- Verify session storage path
- Check PHP session configuration

### SMTP Sending Fails
- Verify sending IP is whitelisted
- Check server firewall rules
- Review logs in sendgrid or PMTA configuration

## 📝 Cron Jobs

Setup the following cron jobs:

```bash
# Bounce processor (run hourly)
0 * * * * /usr/bin/php /var/www/html/bounce_processor/index.php

# Complaint fetcher (run every 6 hours)
0 */6 * * * /usr/bin/php /var/www/html/complain_processor/autoComplainFetcher.php

# Data scheduler (run daily)
0 2 * * * /usr/bin/php /var/www/html/Data_Download/insert_data_action_scheduler.php
```

## 🔐 Security Notes

- Always use HTTPS in production
- Sanitize and validate all user inputs
- Use prepared statements for database queries
- Implement rate limiting on API endpoints
- Regularly backup database
- Keep PHP and dependencies updated
- Use strong authentication credentials
- Implement CSRF protection

## 📞 Support & Contact

For issues or questions:
1. Check the Troubleshooting section
2. Review module-specific documentation
3. Check log files in `admin/temp/` and `complain_processor/`
4. Contact system administrator - Karan Giri [karangiri77@gmail.com] [+91-7978568676]

## 🔄 Version History

- **v1.0** - Initial release
  - Admin dashboard
  - Basic bounce processing
  - IMAP integration
  - Data management

## 📚 Additional Resources

- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Apache Documentation](https://httpd.apache.org/docs/)
- [IMAP RFC 3501](https://tools.ietf.org/html/rfc3501)

---

**Last Updated**: December 13, 2025  
**Maintained By**: Karan Giri [karangiri77@gmail.com] [+91-7978568676]
