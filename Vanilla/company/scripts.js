////////////////////////////////////////////////////////////////////////////////////////
// Define Project specific variables

const GOOGLE_RECAPTCHA = "SITE_KEY";

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
