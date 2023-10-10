function success(msg, data) {

    return {

        status_code: 1,

        status_text: 'success',

        message: msg,

        data: data

    }

}



function failed(msg, data) {

    return {

        status_code: 0,

        status_text: 'failed',

        message: msg,

        data: data

    }

}

exports.success = success;
exports.failed = failed;