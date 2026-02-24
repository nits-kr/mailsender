<?php
include "session.php";
// Database connection (update with your credentials)
$host = 'localhost';
$user = 'root';
$pass = 'dvfersefag243435';
$db_offer = 'offer_module';
$db_supp = 'suppression_v2';

// Connect to offer_module DB
$offer_conn = new mysqli($host, $user, $pass, $db_offer);
if ($offer_conn->connect_error) {
    die('Offer DB Connection failed: ' . $offer_conn->connect_error);
}
// Connect to suppression_v2 DB
$supp_conn = new mysqli($host, $user, $pass, $db_supp);
if ($supp_conn->connect_error) {
    die('Suppression DB Connection failed: ' . $supp_conn->connect_error);
}

// Handle form submission
$form_error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $offer_id = isset($_POST['offer_id']) ? intval($_POST['offer_id']) : 0;
    $emails = isset($_POST['emails']) ? trim($_POST['emails']) : '';
    if ($offer_id <= 0) {
        $form_error = 'Please select an offer.';
    } elseif (empty($emails)) {
        $form_error = 'Please enter at least one email.';
    } else {
        // Split emails by new line or comma
        $email_arr = preg_split('/[\r\n,]+/', $emails);
        $valid_emails = array();
        foreach ($email_arr as $email) {
            $email = trim($email);
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $valid_emails[] = $email;
            }
        }
        if (empty($valid_emails)) {
            $form_error = 'No valid email addresses found.';
        } else {
            // Insert emails
            $stmt = $supp_conn->prepare('INSERT INTO manual_suppression_id (omid, email_id) VALUES (?, ?)');
            foreach ($valid_emails as $em) {
                $stmt->bind_param('is', $offer_id, $em);
                $stmt->execute();
            }
            $stmt->close();
            $form_error = 'Emails added successfully!';
        }
    }
}

// Fetch offers for dropdown
$offers = array();
$res = $offer_conn->query('SELECT sno, offer_name FROM offermaster ORDER BY offer_name');
while ($row = $res->fetch_assoc()) {
    $offers[] = $row;
}
$res->free();

// Fetch grouped suppression data
$supp_data = array();
$sql = "SELECT ms.omid, o.offer_name, COUNT(ms.email_id) as email_count FROM $db_supp.manual_suppression_id ms JOIN $db_offer.offermaster o ON ms.omid = o.sno GROUP BY ms.omid ORDER BY o.offer_name";
$res = $supp_conn->query($sql);
while ($row = $res->fetch_assoc()) {
    $supp_data[] = $row;
}
$res->free();

$offer_conn->close();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Complainer Suppression Email Management Portal</title>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script> 
    <link rel="stylesheet" href="styles.css">
    <script>
    function toggleEmails(omid) {
        var row = document.getElementById('emails-' + omid);
        if (row.style.display === 'table-row') {
            row.style.display = 'none';
        } else {
            // If not loaded, fetch via AJAX
            if (!row.dataset.loaded) {
                fetch('fetch_emails.php?omid=' + omid)
                    .then(resp => resp.text())
                    .then(html => {
                        document.getElementById('email-list-' + omid).innerHTML = html;
                        row.dataset.loaded = '1';
                        row.style.display = 'table-row';
                    });
            } else {
                row.style.display = 'table-row';
            }
        }
    }

    // Make deleteSuppressionEmail globally available
    function deleteSuppressionEmail(omid, email, btn) {
        if (!confirm('Are you sure you want to remove this email from suppression?')) return;
        btn.disabled = true;
        fetch('remove_suppression_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'omid=' + encodeURIComponent(omid) + '&email=' + encodeURIComponent(email)
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.success) {
                // Remove the email row from the UI
                var li = btn.closest('li');
                if (li) li.remove();
            } else {
                alert(data.error || 'Failed to remove email.');
                btn.disabled = false;
            }
        })
        .catch(() => {
            alert('Failed to remove email.');
            btn.disabled = false;
        });
    }
    </script>
    <script>
    // Clear form fields if submission was successful
    window.addEventListener('DOMContentLoaded', function() {
        var successDiv = document.querySelector('.text-success');
        if (successDiv) {
            var form = document.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    });
    </script>
    <script>
        // Offer Select box
        $(document).ready(function() {
            $('#offer_id').select2();
        });
    </script>
</head>
<body>
    <center><h1>Complainer Suppression Email Management Portal</h1></center>
    <div class="form-section">
        <form method="post" action="">
            <label for="offer_id">Select Offer:</label>
            <select name="offer_id" id="offer_id" required>
                <option value="">-- Select Offer --</option>
                <?php foreach ($offers as $offer): ?>
                    <option value="<?= htmlspecialchars($offer['sno']) ?>" <?= (isset($_POST['offer_id']) && $_POST['offer_id'] == $offer['sno']) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($offer['offer_name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <label for="emails">Complainer Email ID(s):</label>
            <textarea name="emails" id="emails" rows="4" placeholder="Enter one or more email addresses, separated by comma or new line" required><?= isset($_POST['emails']) ? htmlspecialchars($_POST['emails']) : '' ?></textarea>
            <button type="submit">Add to Suppression</button>
            <?php if ($form_error): ?>
                <div class="<?= strpos($form_error, 'successfully') !== false ? 'success' : 'error' ?>">
                    <?= htmlspecialchars($form_error) ?>
                </div>
            <?php endif; ?>
        </form>
    </div>
    <div class="table-section">
        <h2>Suppression List</h2>
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Offer Name</th>
                    <th>Email Count</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($supp_data as $row): ?>
                <tr>
                    <td><button class="expand-btn" onclick="toggleEmails(<?= $row['omid'] ?>)">+</button></td>
                    <td><?= htmlspecialchars($row['offer_name']) ?></td>
                    <td><?= $row['email_count'] ?></td>
                </tr>
                <tr id="emails-<?= $row['omid'] ?>" class="email-list-row" data-loaded="">
                    <td colspan="3" class="email-list" id="email-list-<?= $row['omid'] ?>">Loading...</td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
