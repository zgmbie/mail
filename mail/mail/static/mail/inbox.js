document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.getElementById("compose-form").addEventListener('submit', send);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-details').style.display = 'block';

      document.querySelector("#email-details").innerHTML = `
      <ul class="list-group">
      <li class="list-group-item">From : ${email.sender}</li>
      <li class="list-group-item">To : ${email.recipients}</li>
      <li class="list-group-item">subject : ${email.subject}</li>
      <li class="list-group-item">Timestamp : ${email.timestamp}</li>
      <li class="list-group-item">${email.body}</li>
    </ul>
      `

      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      const arch = document.createElement('button');
      arch.innerHTML = email.archived ? 'Unarchived' : 'Archived';
      // arch.className = email.archived ? 'btn btn-success' : 'btn btn-danger';
      arch.className = email.archived ? 'unarchived' : 'archived';
      arch.addEventListener('click', function () {
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
          })
          .then(() => {
            load_mailbox('archived')
          })
      });
      document.querySelector('#email-details').append(arch);

      const rep = document.createElement('button');
      rep.innerHTML = 'Replay'
      rep.className = 'replay';
      rep.addEventListener('click', function () {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let s = email.subject;
        if (s.split(' ', 1)[0] != "Re:") {
          s = "Re:" + email.subject;
        }
        document.querySelector('#compose-subject').value = s;
        document.querySelector('#compose-body').value = `On ${email.timestamp}  ${email.sender} wrote : ${email.body}`;

      });
      document.querySelector('#email-details').append(rep);

    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      emails.forEach(singleEmail => {

        console.log(singleEmail);

        const newEmail = document.createElement('div');
        newEmail.className = "list-group-item";

        newEmail.className = singleEmail.read ? 'gray' : 'white';


        newEmail.innerHTML = `
        <h3>sender : ${singleEmail.sender}</h3>
        <h4>subject : ${singleEmail.subject}</h4>
        <p>timestamp : ${singleEmail.timestamp}</p>
        `;
        newEmail.addEventListener('click', function () {
          view(singleEmail.id)

        });
        document.querySelector('#emails-view').append(newEmail);
      })

      // ... do something else with emails ...
    });
}

function send(e) {
  e.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
}