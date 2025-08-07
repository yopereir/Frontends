---
title: "Contact Us"
---
<div class="container">
<h2>Contact Us</h2>
<div style="text-align: center">Call us at {{< param phone >}} or fill out the form below and we'll reach out to you.</div>
<form id="contact-form" method="GET" action="/thankyou">
  <div>
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name" required>
  </div>
  <div>
    <label for="contact">Email or Phone:</label><br>
    <input type="text" id="contact" name="contact">
    <span id="contact-error" class="error-message" style="color: red;"></span>
  </div>
  <div>
    <label for="message">Message:</label><br>
    <textarea id="message" name="message" required></textarea>
  </div>
  <div>
    <button type="submit" class="button">Send Message</button>
  </div>
  <div id="form-error" class="error-message" style="color: red; text-align: center; margin-top: 10px;"></div>
</form>
</div>

<script>
  document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Clear previous error messages
    //document.getElementById('email-error').textContent = '';
    //document.getElementById('phone-error').textContent = '';
    document.getElementById('contact-error').textContent = '';
    document.getElementById('form-error').textContent = '';

    let isValid = true;
/*
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailPattern.test(email)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value;
    const phonePattern = /^[\d\s\-\(\)]+$/;
    const digitCount = phone.replace(/[^\d]/g, '').length;

    if (phone && (!phonePattern.test(phone) || digitCount < 7)) {
      document.getElementById('phone-error').textContent = 'Please enter a valid phone number.';
      isValid = false;
    }
    if (!(phone || email)) {
      document.getElementById('form-error').textContent = 'Please enter either an email or phone number.';
      isValid = false;
    }
*/
    const contact = document.getElementById('contact').value;
    if (!(contact)) {
      document.getElementById('contact-error').textContent = 'Please enter either an email or phone number.';
      isValid = false;
    }

    if (isValid) {
      const form = event.target;
      const formData = new FormData(form);
      const queryString = new URLSearchParams(formData).toString();
      const url = form.action + '?' + queryString;

      try {
        const response = await fetch(url, {
          method: 'GET',
          // No headers needed for a simple GET request with query parameters
        });

        if (response.ok) {
          window.location.href = form.action; // Redirect to thankyou page
        } else {
          const errorText = await response.text();
          document.getElementById('form-error').textContent = 'Form submission failed: ' + errorText;
        }
      } catch (error) {
        document.getElementById('form-error').textContent = 'An error occurred during submission: ' + error.message;
      }
    }
  });
</script>