var assert = require('assert');
var filterable = require('../');

function assertQuery(q, out) {
    assert.deepEqual(filterable.Query(q).parse().toJSON(), out);
}

describe('Query#parse', function() {
    it('can parse a condition', function() {
        assertQuery('user:sampleuser', [
            {
                field: 'user',
                operator: '=',
                value: 'sampleuser',
                originalField: 'user'
            }
        ]);
    });

    it('can parse multiple conditions', function() {
        assertQuery('Ruby created:>=2020-01-01', [
            {
                field: '',
                operator: '=',
                value: 'Ruby',
                originalField: ''
            },
            {
                field: 'created',
                operator: '>=',
                value: '2020-01-01',
                originalField: 'created'
            }
        ]);
    });

    it('can parse =', function() {
        assertQuery('user:=sampleuser', [
            {
                field: 'user',
                operator: '=',
                value: 'sampleuser',
                originalField: 'user'
            }
        ]);
    });

    it('can parse !=', function() {
        assertQuery('user:!=sampleuser', [
            {
                field: 'user',
                operator: '!=',
                value: 'sampleuser',
                originalField: 'user'
            }
        ]);
    });

    it('can parse >', function() {
        assertQuery('stocks:>10', [
            {
                field: 'stocks',
                operator: '>',
                value: '10',
                originalField: 'stocks'
            }
        ]);
    });

    it('can parse <', function() {
        assertQuery('stocks:<100', [
            {
                field: 'stocks',
                operator: '<',
                value: '100',
                originalField: 'stocks'
            }
        ]);
    });

    it('can parse >=', function() {
        assertQuery('created:>=2020-01-01', [
            {
                field: 'created',
                operator: '>=',
                value: '2020-01-01',
                originalField: 'created'
            }
        ]);
    });

    it('can parse <=', function() {
        assertQuery('created:<=2020-12-31', [
            {
                field: 'created',
                operator: '<=',
                value: '2020-12-31',
                originalField: 'created'
            }
        ]);
    });

    it('can parse - (not-qualifier)', function() {
        assertQuery("-user:sampleuser stocks:>10",[
            {
                field: 'user',
                operator: '!=',
                value: 'sampleuser',
                originalField: 'user'
            },
            {
                field: 'stocks',
                operator: '>',
                value: '10',
                originalField: 'stocks'
            }
        ]);
    });

    it('quotation marks are removed', function() {
        assertQuery('"user":"sample user"', [
            {
                operator: '=',
                field: 'user',
                value: 'sample user',
                originalField: 'user'
            }
        ]);
    });

    it('can detect complete queries', function() {
        var q = filterable.Query('user:sampleuser').parse();
        assert.equal(q.isComplete(), true);
    });

    it('can detect non-complete queries', function() {
        var q = filterable.Query('user:sampleuser invalid:test', { rejected: ['invalid'] }).parse();
        assert.equal(q.isComplete(), false);
    });
});
