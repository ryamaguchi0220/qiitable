var _ = require('lodash');

var GROUP_DELIMITER = /(?:[^+"]+|"[^"]*")+/g;
var FILTER_DELIMITER = ":";
var NOT_TYPE = "-";
var INVERT = {
    "=": "!=",
    ">=": "<",
    ">": "<=",
    "!=": "=",
    "<=": ">",
    "<": ">=",
};
var GROUP_TYPES = _.keys(INVERT);


// Split a string into an array of string (groups)
function splitInGroup(s) {
    return s.match(GROUP_DELIMITER);
}

// Remove quotation marks
function removeQuotation(s) {
    return s.replace(/['"]+/g, '');
}

// Detect group type
function detectGroupType(query) {
    return _.find(GROUP_TYPES, function(type) {
        return query.indexOf(type) === 0;
    }) || "";
};

// Return whether a group is invalid or not
function isInvalidGroup(group) {
    var parts = group.split(FILTER_DELIMITER);
    var hasNoFilterDelimiter = parts.length === 1;
    var hasEmptyField = parts[0].trim().length === 0;

    return hasNoFilterDelimiter || hasEmptyField;
}

// Split a group in {field,query,type,value}
function splitGroup(querystring) {
    var isNotType = querystring.startsWith(NOT_TYPE);
    var parts = querystring.split(FILTER_DELIMITER);
    var field = isNotType ? removeQuotation(parts[0].slice(1)) : removeQuotation(parts[0]);
    var query = removeQuotation(parts.slice(1).join(FILTER_DELIMITER));
    var type = detectGroupType(query);
    var value = query.slice(type.length);
    type = type || "=";
    type = isNotType ? INVERT[type] : type;

    return {
        field: field,
        type: type,
        value: value,
        invalid: isInvalidGroup(querystring)
    };
};

// Parse a group into an object representation
function parseGroup(group, options) {
    var parts = splitGroup(group);

    return {
        "field": parts.field,
        "type": parts.type,
        "value": parts.value,
        "invalid": parts.invalid
    };
}

// Filter groups to eliminate or convert fields (according to alias)
// And apply middlewares to values
function filterFields(groups, options) {
    return _.reduce(groups, function(_groups, group) {
        // Eliminate if non existant field
        if (_.contains(options.rejected || [], group.field)) return _groups;

        var baseField = group.field;
        var fieldDef = options.fields[group.field] || {};

        group.originalField = baseField;

        // Convert field if alias
        group.field = fieldDef.alias || baseField;

        // Convert type
        if (fieldDef.type) group.value = fieldDef.type (group.value);

        if (group) _groups.push(group);
        return _groups;
    }, []);
}

module.exports = {
    splitInGroup: splitInGroup,
    removeQuotation: removeQuotation,
    detectGroupType: detectGroupType,
    isInvalidGroup: isInvalidGroup,
    splitGroup: splitGroup,
    parseGroup: parseGroup,
    filterFields: filterFields
};
