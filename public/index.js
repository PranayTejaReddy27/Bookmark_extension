document.addEventListener('DOMContentLoaded', () => {
    // Get the dropdown content
    const dropdownContent = document.getElementById("myDropdown");
  
    // Hide the dropdown content by default
    dropdownContent.style.display = "none";
  
    // Toggle the visibility of the dropdown content when the image is clicked
    document.getElementById("pluse").onclick = function() {
      if (dropdownContent.style.display === "none") {
        dropdownContent.style.display = "block";
      } else {
        dropdownContent.style.display = "none";
      }
    };
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
    
        // Fetch form data
        const url = document.getElementById('url').value;
        const tags = document.getElementById('tags').value;
        const browser = document.getElementById('browser').value;
    
        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();
    
        // Configure the request
        xhr.open('PUT', '/submit-form');
        xhr.setRequestHeader('Content-Type', 'application/json');
    
        // Define the data to be sent
        const data = JSON.stringify({ url, tags, browser });
    
        // Send the request
        xhr.send(data);
    
        // Handle the response
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('Form data sent successfully');
                // Optionally, reset the form fields after successful submission
                document.getElementById('url').value = '';
                document.getElementById('tags').value = '';
                document.getElementById('browser').value = '';
            } else {
                console.error('Failed to send form data');
            }
        };
    
        xhr.onerror = function() {
            console.error('Error sending form data');
        };
    };
    
    // Add event listener to the form submit button
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
    
  });
