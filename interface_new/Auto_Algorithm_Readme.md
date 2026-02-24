step-by-step algorithm for your Auto Email Program:

### **Algorithm: Auto Email Program**

#### **Step 1: Start Program**
- Begin the execution of the email program.

#### **Step 2: Pull Template Details**
- Query the `Svml_sendgrid` table using the `sno` (serial number).
- Store the required template details for the current run.
- Check for Template is approved or not ?

#### **Step 3: Check for Active IPs**
- Query the `Svml_ip_pool` table using `Svml_sendgrid_id`.
- Filter and store the active IPs associated with the template.

#### **Step 4: Check for Datafile Count**
- Check if there is a sufficient count of data available to proceed with the email sends.
- If data count is insufficient, halt the process and notify the system.

#### **Step 5: Trigger Test Emails**
- Select at least **3 active IPs** and **2 email IDs**.
- Send a test email using the selected IPs and email IDs.

#### **Step 6: Record Test Results**
- For each test email, record the following in a result table:
  - `Svml_sendgrid_id`
  - `IP`
  - `Message ID`
  - `Email`

   CREATE TABLE `auto_script_test_status` (
   `sno` int(255) NOT NULL AUTO_INCREMENT,
   `svml_sendgrid_id` int(255) NOT NULL,
   `ip` varchar(20) NOT NULL,
   `email` varchar(30) NOT NULL,
   `msgid` varchar(256) NOT NULL,
   `status` varchar(20) DEFAULT NULL,
   `sent_status` int(3) NOT NULL,
   `loggedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`sno`)
   ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1


#### **Step 7: Check Message ID Status**
- Retrieve the status of all test `Message IDs` sent to actual email IDs.

#### **Step 8: Evaluate Inbox Percentage**
1. **If `Message ID Found %` > Expected Inbox Percentage & all `Message IDs` Fetched**:
   - Start bulk email sending based on:
     - `Total Send`
     - `Limit to Send`
     - `Wait and Sleep Time`
   - Continue sending until the count is reached.
   - Divide Inbox Test After equally for all Active IP's 
   - Continue Sending for all Ips
   - After reaching the count, go back to **Step 5** to test again.

2. **If `Message ID Found %` < Expected Inbox Percentage & all `Message IDs` Fetched**:
   - Stop the mailing process.
   - Notify the system that the Inbox Percentage requirement was not met.

3. **If `Message ID Found %` < Expected Inbox Percentage & not all `Message IDs` Fetched**:
   - Wait for all Message IDs to be fetched.
   - Once all are fetched, re-evaluate the Inbox Percentage and proceed accordingly.

#### **Step 9: End Process**
- The program either continues from **Step 5** or halts based on the results from the inbox percentage evaluation.

---