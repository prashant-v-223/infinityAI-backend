'use strict'

var commonQueries = {}

commonQueries.decodeUris = (body) => {
    if (body) Object.keys(body).map((x) => (body[x] = decodeURIComponent(body[x])))
    return body
}

commonQueries.cloneDeep = (array) => {
    if (array) return JSON.parse(JSON.stringify(array))
    return array
}

commonQueries.findOneRecord = async (model, condition, fetchValue) => {
    return new Promise((resolve, reject) => {
        model.findOne(condition, fetchValue, (error, record) => {
            error ? reject(error) : resolve(record)
        })
    })
}

commonQueries.findAllRecord = async (model, condition, fetchValue) => {
    return new Promise((resolve, reject) => {
        model.find(condition, fetchValue, (error, record) => {
            error ? reject(error) : resolve(record)
        }).sort({ createdAt: -1 }).limit(500)
    })
}

commonQueries.updateRecordValue = async (object, req) => {
    Object.keys(object).forEach((item) => {
        if (req.body.hasOwnProperty(item)) {
            object[item] = req.body[item]
        }
    })
}

commonQueries.updateRecord = async (model, condition, fetchValue) => {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(condition, fetchValue, (error, object) => {
            error ? reject(error) : resolve(object)
        })
    })
}

commonQueries.hardDeleteRecord = async (model, condition, fetchValue) => {
    return new Promise((resolve, reject) => {
        model.findOneAndDelete(condition, fetchValue, (error, object) => {
            error ? reject(error) : resolve(object)
        })
    })
}

commonQueries.updateRecordValueForSoftDelete = async (model, condition, fetchValue) => {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(condition, fetchValue, (error, object) => {
            error ? reject(error) : resolve(object)
        })
    })
}

module.exports = commonQueries