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

  //Ip data to send
  let clientIp = "";

  function getPublicIPAddress() {
    // Return a promise that resolves with the IP address
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', 'https://api.ipify.org/?format=json');
      request.onload = function() {
        if (request.status === 200) {
          const ipData = JSON.parse(request.responseText);
          resolve(ipData.ip.replace(/\./g, '_'));
        } else {
          reject(Error('Failed to fetch IP address'));
        }
      };
      request.onerror = function() {
        reject(Error('Failed to fetch IP address'));
      };
      request.send();
    });
  }

  // Call the function to get the IP address
  getPublicIPAddress()
    .then(ip => {
      console.log('Public IP Address:', ip);
      clientIp = '_' + ip;
      console.log('clientIp :', clientIp)
      
      const dataToSend = {
        clientIp: clientIp,
      };

      // Make a POST request to the server
      fetch('/endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Specify the content type
        },
        body: JSON.stringify(dataToSend) // Convert the data to JSON format
      })
      .then(response => {
        if (response.ok) {
          console.log('Data sent successfully');
        } else {
          console.error('Failed to send data');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    })
    .catch(error => {
      console.error('Error getting public IP address:', error);
    });
});
