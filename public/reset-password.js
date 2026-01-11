    // Get token from URL
    document.addEventListener("DOMContentLoaded", () => {
      // Get token from URL
      const token = new URLSearchParams(window.location.search).get("token");
     
      document.getElementById("tokenInput").value = token;
    
      // Submit form
      document.getElementById("resetForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
    
        try {
          const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password, confirmPassword }) // token is now defined
          });
          const text = await res.text();
          alert(text);
        } catch (err) {
          console.error(err);
          alert("Error resetting password");
        }
      });
    });
    
      