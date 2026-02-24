<?php
include "session.php";
include "include.php"; // Database connection file
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Store Email Account Details</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Link to the external CSS file -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="left-div">
            <div class="heading-main">
                Complain Fetcher
            </div>
            <br>
            <!-- Button to open the popup -->
            <button id="addButton">ADD COMPLAINER EMAIL</button>
            <br><br>
            <!-- <a href = 'http://75.119.149.20/complain_processor/fetched_complains/' target='_blank'><button id="addButton">AUTO FETCHED COMPLAINERS</button></a> -->
            <!-- Popup for Store Email Account Details -->
            <div class="popup-overlay" id="popupOverlay"></div>
            <div class="popup" id="popup">
                <button class="close-btn" id="closePopupBtn">X</button>
                    <h1>Store Email Account Details</h1>
                    <form method="POST" action="store_action.php">
                        <div>
                            <label for="accountType">Account Type:</label>
                            <select id="accountType" name="accountType" required>
                                <!-- <option value="sentora">Sentora</option> -->
                                <option value="yahoo_fbl">Yahoo FBL</option>
                            </select>
                        </div>
                        <div>
                            <label for="imapHost">Inbox IMAP Host:</label>
                            <input type="text" id="inboxImapHost" name="inboxImapHost"  placeholder='{imap.mail.yahoo.com:993/imap/ssl}INBOX' required>
                        </div>
                        <div>
                            <label for="imapHost">Spam IMAP Host:</label>
                            <input type="text" id="spamImapHost" name="spamImapHost" placeholder='{imap.mail.yahoo.com:993/imap/ssl}Bulk'required>
                        </div>
                        <div>
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter Email" required>
                        </div>
                        <div>
                            <label for="password">Password:</label>
                            <input type="text" id="password" name="password" placeholder="Enter Password" required>
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                    <!-- Table to display details -->
                    <div id="emailDetailsTable">
                        <table id="detailsTable">
                            <thead>
                                <tr>
                                    <th>Account Type</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                // Query to fetch emails from the database
                                $sql = "SELECT * FROM email_accounts";
                                $result = $conn->query($sql);
                                if ($result->num_rows > 0) {
                                    // Loop through the results and populate the select options
                                    while($row = $result->fetch_assoc()) { 
                                        echo "<tr>
                                                <th>$row[accountType]</th>
                                                <th>$row[email]</th>
                                                <th>
                                                    <button class='action-btn edit-btn' onclick='action($row[sno], \"edit\")'>
                                                        <i class='fas fa-edit'></i>
                                                    </button>
                                                    <button class='action-btn delete-btn' onclick='action($row[sno], \"delete\")'>
                                                        <i class='fas fa-trash'></i>
                                                    </button>
                                                </th>
                                            </tr>";
                                    }
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Send Email Section -->
                <div class="form-wrapper">
                    <h1>Fetch Complainer</h1>
                    <label for="selectEmail">Select Email:</label>
                    <select id="selectEmail" name="selectEmail">
                        <?php
                        // Query to fetch emails from the database
                        $sql = "SELECT email FROM email_accounts";
                        $result = $conn->query($sql);
                        if ($result->num_rows > 0) {
                            // Loop through the results and populate the select options
                            while($row = $result->fetch_assoc()) {
                                echo "<option value='" . htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8') . "</option>";
                            }
                        } else {
                            echo "<option>No emails found</option>";
                        }
                        ?>
                    </select>
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" rows="5" placeholder="Enter your message"></textarea>
                    <button id="submitBtn" type="button">Submit</button>
                </div>
        </div>
        <div class="right-div" id="rightDiv">
            <?php
            // Get the list of files in the directory
            $lines = `ls -1tr /var/www/html/complain_processor/fetched_complains/ | grep -v 'index'`;
            $lineArr = explode("\n", trim($lines));
            $lineArr = array_reverse($lineArr);
            ?>
            <div id="fileList" class="file-list">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2 id="fileListHeading">COMPLAIN FILE LIST</h2>
                    <a href="fetchLog.txt" target="_blank">
                        <button id="autolog">AUTO RUN LOG</button>
                    </a>
                </div>
                <table id="fileTable">
                    <thead>
                        <tr>
                            <th id="fileNameHeader">File Name</th>
                            <th id="createdDateHeader">Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        foreach ($lineArr as $file) {
                            $removedExtension = str_replace(".txt", "", $file);
                            $splitLine = explode("_", $removedExtension);
                            echo "<tr>
                                    <td><a href='fetched_complains/$file' target='_blank'>$splitLine[0]</a></td>
                                    <td>$splitLine[1]</td>
                                </tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    </div>
    <!-- Link to the external JavaScript file -->
    <script src="scripts.js"></script>
</body>
</html>
