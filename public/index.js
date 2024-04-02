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

  });
