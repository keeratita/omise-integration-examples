var checkoutForm = document.getElementById("checkoutForm");
checkoutForm.addEventListener("submit", submitHandler, false);

// Submit handler for checkout form.
function submitHandler(event) {
  event.preventDefault();

  $("#errorMessage")
    .addClass("d-none")
    .html("");

  /*
  NOTE: Using `data-name` to prevent sending credit card information fields to the backend server via HTTP Post
  (according to the security best practice https://www.omise.co/security-best-practices#never-send-card-data-through-your-servers).
  */
  var cardObject = {
    name: document.querySelector('[id="cardName"]').value,
    number: document.querySelector('[id="cardNumber"]').value,
    expiration_month: document.querySelector('[id="cardMonth"]').value,
    expiration_year: document.querySelector('[id="cardYear"]').value,
    security_code: document.querySelector('[id="cardCVV"]').value
  };

  Omise.createToken("card", cardObject, function(statusCode, response) {
    if (statusCode === 200) {
      // Success: assign Omise token back to your checkout form.
      checkoutForm.omiseToken.value = response.id;

      // Then, perform a form submit action.
      checkoutForm.submit();
    } else {
      // Error: display an error message. Note that `response.message` contains
      // a preformatted error message. Also note that `response.code` will be
      // "invalid_card" in case of validation error on the card.

      $("#errorMessage")
        .removeClass("d-none")
        .html(
          `<div>code: ${response.code}</div><div>message: ${
            response.message
          }</div>`
        );
      console.log(response);
    }
  });
}
