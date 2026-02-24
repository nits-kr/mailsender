// Get the elements
const addButton = document.getElementById('addButton');
const popup = document.getElementById('popup');
const popupOverlay = document.getElementById('popupOverlay');
const closePopupBtn = document.getElementById('closePopupBtn');
const selectEmail = document.getElementById('selectEmail');
const messageTextarea = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');

// Open the popup when the ADD button is clicked
addButton.addEventListener('click', () => {
    popup.style.display = 'block';
    popupOverlay.style.display = 'block';
});

// Close the popup when the close button is clicked
closePopupBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    popupOverlay.style.display = 'none';
});

// Close the popup when the overlay is clicked
popupOverlay.addEventListener('click', () => {
    popup.style.display = 'none';
    popupOverlay.style.display = 'none';
});

// Handle the Submit button click
submitBtn.addEventListener('click', function() {
    const selectedEmail = selectEmail.value;

    if (selectedEmail) {
        // Display the "Processing..." message
        messageTextarea.value = 'Processing...';

        // Make an Ajax call to fetch the complaints
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'fetchComplainImap.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Update the textarea with the result
                messageTextarea.value = xhr.responseText;
            } else {
                // In case of an error, show the error message
                messageTextarea.value = 'Error fetching complaints.';
            }
        };
        xhr.send('email=' + encodeURIComponent(selectedEmail));
    } else {
        // If no email is selected, show an error message
        messageTextarea.value = 'Please select an email first.';
    }
});

function action(rows, action) {
    if (action === 'edit') {
        // Make an Ajax call to fetch the email details
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'fetchEmailForEdit.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                // Update the popup with the email details
                document.getElementById('inboxImapHost').value = response.inboxImapHost;
                document.getElementById('spamImapHost').value = response.spamImapHost;
                document.getElementById('email').value = response.email;
                document.getElementById('password').value = response.password;
                document.getElementById('accountType').value = response.accountType;
                const accountTypeSelect = document.getElementById('accountType');
                const options = accountTypeSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === response.accountType) {
                        options[i].selected = true;
                        break;
                    }
                }
                
            } else {
                // In case of an error, show the error message
                messageTextarea.value = 'Error fetching email details.';
            }
        };
        xhr.send('sno=' + encodeURIComponent(rows));
    } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this email?')) {
            // Make an Ajax call to delete the email
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'delete.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Display success message
                    alert('Email deleted successfully.');
                    // Refresh the page after deleting the email
                    location.reload();
                } else {
                    // In case of an error, show the error message
                    alert('Error deleting email.');
                }
            };
            xhr.send('sno=' + encodeURIComponent(rows));
        }
    }
}