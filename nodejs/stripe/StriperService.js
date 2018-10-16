const  stripe = require("stripe")(sails.config.stripeKey);
const utility = require("./Utility")
const logger = sails.log;

module.exports = {

 fetchStripeToken:  (cardNumber, expMonth, expYear, cvc, isSaveCardDetails = true, clientUser, errorCallBack, successCallBack) => {
   console.log("fetch stripe token");
   try {

     stripe.tokens.create({
       card: {
         "number": cardNumber,
         "exp_month": expMonth,
         "exp_year": expYear,
         "cvc": cvc
       }
     }, async function (err, token) {
       logger.info("token==", token);
       token = JSON.stringify(token);
       let parseToken = utility.parsePaymentToken(token);
       if (err) {
         return errorCallBack(err)
       }

       if(isSaveCardDetails) {

         stripe.customers.create({
           description: 'Customer for ' + clientUser.userName,
         },  (err, customer) => {
           if(err) {
             logger.info("Error in creating customer for user "+clientUser.userName);
             return errorCallBack(err)
           }

           logger.info("update customer Id ");

           //clientUser.stripeCustomerId = customer.id;



           stripe.customers.createSource(
             customer.id,{ source: parseToken},
             async (err, cardData) => {
               if(err) {
                 logger.info("Errors in creating customer", err);
                 return errorCallBack(err)
               }

               await User.update({id:clientUser.id}, {stripeCustomerId:customer.id, stripeTransactionToken:token});
               if (!clientUser) {
                 logger.info("Error in updating user..");
                 return errorCallBack(err)
               }
               logger.info("cardData after all validation", cardData);
               return successCallBack(parseToken)

             });
         })
       }
/*

        await User.update({id:clientUser.id}, {stripeTransactionToken:token});
       if (!clientUser) {
         logger.info("Error in updating user..");
         return errorCallBack()
       }

       successCallBack(parseToken)
*/
     });
   } catch(e) {
     logger.info("Errors in creating domain", e);
     errorCallBack(e)
   }
 },

  makePayment: (customerId, amount, description = "", transactionData, errorCallBack, successCallBack) => {
    try {
      let stripeCharge = stripe.charges.create({
        amount: amount,
        currency: 'usd',
        description: description,
        customer: customerId
      }, async (error, transaction) => {
        if(error) {
          console.log("Error in the payment transaction1=", error);
          return errorCallBack()

        }
        logger.info('transaction while charge stripe', transaction)
        transactionData["transactionDetails"] = JSON.stringify(transaction)
        await TransactionDetails.create(transactionData);
        successCallBack()
      });
      //conditionData

    }catch(e) {
      console.log("Error in the payment transaction=", e);
      errorCallBack()
    }
    //return stripeCharge
  //  return charge;

  }
};

