document.getElementById("signUpBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("Please enter all fields");

const payload = { 
    login_event : "Sign-up",

    data : {
    User_id  : username,
    Password : password,
    Web_source  : "Switch_Tracker" }
 };
  
  const res = await fetch("https://sign-up-page-214580149659.us-west1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const data = await res.json();
    console.log("Sign up =>" , data);
    localStorage.setItem("user_id", data.user_id);
    window.location.href = "personal_details.html";
  } else {
    alert("Signup failed. Try again!");
  }
});

document.getElementById("signInBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

    const payload = { 
        login_event : "Sign-in",

        data : {
        User_id  : username,
        Password : password,
        Web_source  : "Switch_Tracker" }
    };
  console.log(payload)
  const res = await fetch("https://sign-up-page-214580149659.us-west1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log(res)
  if (res.ok) {
    const data = await res.json();
    console.log("Sign-in => " , data);
    localStorage.setItem("user_id", data.user_id);
    const payload_data={

        "login_event" : "exist" , 
        "data" : {
            "user_id" : data.user_id
        }
    };
    const rest = await fetch("https://switch-tracker-personal-details-214580149659.us-west1.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload_data)
    });

    if (rest.ok) {
            const resp = await rest.json();
            console.log("first_time" , resp);
            localStorage.setItem("usr_cmpy_id", resp.usr_cmpy_id);
            window.location.href = "home.html";
    } else {
            alert("Failed to save details. Try again!");
    }
    
  } else {
    alert("Invalid credentials!");
  }
});
