

document.getElementById("detailsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  user_id = localStorage.getItem("user_id");


  payload_data={
    "login_event" :  "new" , 
    "data" : {
        "user_id" : user_id ,
        "company_name" : data.company_name ,
        "role" : data.role ,
        "jd" :  data.joined_date
    }
  }

  const res = await fetch("https://switch-tracker-personal-details-214580149659.us-west1.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload_data)
  });

  if (res.ok) {
    const resp = await res.json();
    console.log("first_time" , resp);
    localStorage.setItem("usr_cmpy_id", resp.usr_cmpy_id);
    window.location.href = "home.html";
  } else {
    alert("Failed to save details. Try again!");
  }
});
