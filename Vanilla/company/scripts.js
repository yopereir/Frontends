////////////////////////////////////////////////////////////////////////////////////////
// Define Project specific variables

const GOOGLE_RECAPTCHA = "SITE_KEY";
const GOOGLE_APPSCRIPT_CONTACT_URL = "https://script.google.com/macros/s/AKfycbwzNvD6kqGtGEsluak9ZzQ0e5yKyure0na2HvkifUlUjlo0iZt2uWvnHWhGcEGnmW_qWg/exec"; // this can be public since it is visible to end user.
const GOOGLE_APPSCRIPT_JOB_URL = "https://script.google.com/macros/s/AKfycbwKI_63iPjoV6rTpsKVXP-xnWvxsZzV3wRIXyglkt7gcf8f67zG8T8TNG3_MfDHSIeI4w/exec"; // this can be public since it is visible to end user.

var navigationLinks = [
  { name: "Create Job", url: "createJob.html" },
  { name: "Job List", url: "jobList.html" },
  { name: "Login", url: "login.html" },
  { name: "User Profile", url: "userProfile.html" }
];
var headerInfo = { name: "Job Board", url: "index.html" };

////////////////////////////////////////////////////////////////////////////////////////
// General functions

function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
          document.getElementById(id).innerHTML = data;
          const scripts = document.getElementById(id).querySelectorAll("script");
          scripts.forEach(script => {
              const newScript = document.createElement("script");
              if (script.src) {
                  // If it's an external script
                  newScript.src = script.src;
                  newScript.onload = () => console.log(`${script.src} loaded`);
              } else {
                  // If it's an inline script, copy its content
                  newScript.textContent = script.textContent;
              }
              document.body.appendChild(newScript); // Append to body to execute
          });
        })
        .catch(error => console.error(`Error loading ${file}:`, error));
}

function loadAllComponents(scopedContainer) {
  var scopedContainer = scopedContainer || document;
  Array.from(scopedContainer.getElementsByClassName("components")).forEach(element => {
    loadComponent(element.id, "./components/"+element.id+".html");
  });
}
