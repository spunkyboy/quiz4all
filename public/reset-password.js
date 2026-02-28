    // Get token from URL
    document.addEventListener("DOMContentLoaded", () => {
      // Get token from URL
      const token = window.location.pathname.split('/').pop();
      console.log(token, 'token kiss')
      document.getElementById("tokenInput").value = token;
    
      // Submit form
      document.getElementById("resetForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const spinner = document.getElementById("spinner");
        const message = document.getElementById("message");
         // Show spinner
        spinner.style.display = "block";
        message.innerText = "";
        
        try {
          const res = await fetch(`/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, confirmPassword }) 
          });
          const dataReset = await res.json();

          if (!res.ok) {
            throw new Error(dataReset.message || "Reset failed");
          }
    
          message.style.color = "green";
          message.innerText = dataReset.message || "Password reset successful";
    
        } catch (err) {
          message.style.color = "red";
          message.innerText = err.message || "Error resetting password";
        } finally {
          // Hide spinner
          spinner.style.display = "none";
        }
      });
    });
    
      