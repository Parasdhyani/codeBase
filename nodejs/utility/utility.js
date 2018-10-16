var loadFromControllerAndToComponent  =  function (url, data,successCallBack, errorCallBack) {

    $.ajax({
      url: url,
      method: 'GET',
      data: data,
      success: function(responseData) {
        successCallBack && successCallBack(responseData)
      },
      failure: function(msg) {
        errorCallBack && errorCallBack(msg)
      }
    });
  };

