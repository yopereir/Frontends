const SUPABASE_URL = "http://example.com";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
//const SUPABASE_URL = "https://ygeccegzvqppczfzuixq.supabase.co";
//const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZWNjZWd6dnFwcGN6Znp1aXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NzEwODcsImV4cCI6MjA1MTQ0NzA4N30.F2RbqrSlHSloFsSGHut2m-3XTBy-DmORyUuEuJlub7Q";
supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log(user);
    if (!user) {
        window.location.href = "login.html"; // Redirect to login page if not logged in
    }
}

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

function loadAllComponents() {
  Array.from(document.getElementsByClassName("components")).forEach(element => {
    loadComponent(element.id, "./components/"+element.id+".html");
  });
}

// Define default global variables
var navigationLinks = [
  { name: "Create Job", url: "createJob.html" },
  { name: "Job List", url: "jobList.html" },
  { name: "Login", url: "login.html" },
  { name: "User Profile", url: "userProfile.html" }
];
var headerInfo = { name: "Job Board", url: "index.html" };