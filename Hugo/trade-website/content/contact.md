---
title: "Contact Us"
---
<div class="container">
<h2>Contact Us</h2>
<form id="contact-form" method="GET" action="/thankyou">
  <p>
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name" required>
  </p>
  <p>
    <label for="email">Email:</label><br>
    <input type="email" id="email" name="email" required>
  </p>
  <p>
    <label for="message">Message:</label><br>
    <textarea id="message" name="message" required></textarea>
  </p>
  <p>
    <button type="submit" class="button">Send Message</button>
  </p>
</form>
</div>

<script>
  document.getElementById('contact-form').addEventListener('submit', function(event) {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
    }
  });
</script>