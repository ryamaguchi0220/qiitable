var _ = require('lodash');

var GROUP_DELIMITER = /(?:[^\s"]+|"[^"]*")+/g;
var FILTER_DELIMITER = ":";
var NOT_QUALIFIER = "-";
var INVERT = {
    "=": "!=",
    ">=": "<",
    ">": "<=",
    "!=": "=",
    "<=": ">",
    "<": ">=",
};
var GROUP_OPERATORS = _.keys(INVERT);


// Split a string into an array of string (groups)
function splitInGroup(s) {
    return s.match(GROUP_DELIMITER);
}

// Remove quotation marks
function removeQuotation(s) {
    return s.replace(/['"]+/g, '');
}

// Detect group operator
function detectGroupOperator(group) {
    return _.find(GROUP_OPERATORS, function(operator) {
        return group.indexOf(operator) === 0;
    }) || "";
};

// Split a group in {field,operator,value}
function splitGroup(group) {
    var startsWithNotQualifier = _.startsWith(group, NOT_QUALIFIER);
    var parts = group.split(FILTER_DELIMITER);
    var isTagGroup = parts.length === 1

    if (isTagGroup) {
        return {
            field: "",
            operator: startsWithNotQualifier ? "!=" : "=",
            value: startsWithNotQualifier ? removeQuotation(parts[0].slice(1)) : removeQuotation(parts[0])
        };
    } else {
        var field = startsWithNotQualifier ? removeQuotation(parts[0].slice(1)) : removeQuotation(parts[0]);
        var query = removeQuotation(parts.slice(1).join(FILTER_DELIMITER));
        var operator = detectGroupOperator(query);
        var value = query.slice(operator.length);
        operator = operator || "=";
        operator = startsWithNotQualifier ? INVERT[operator] : operator;

        return {
            field: field,
            operator: operator,
            value: value
        };
    };
};

// Parse a group into an object representation
function parseGroup(group, options) {
    var parts = splitGroup(group);

    return {
        "field": parts.field,
        "operator": parts.operator,
        "value": parts.value
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
    detectGroupOperator: detectGroupOperator,
    splitGroup: splitGroup,
    parseGroup: parseGroup,
    filterFields: filterFields
};
