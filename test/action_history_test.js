var assert = require("assert");
var proxyquire = require("proxyquire");

var databaseOpsStub = {
    writeActionHistoryEntry: function(actionEntry, callback) {
        var testObj = {
            type: actionEntry.type,
            item: actionEntry.item,
            username: actionEntry.username,
            ip_address: actionEntry.ipAddress,
            info: actionEntry.info,
            action_date: new Date(0)
        };

        callback(null, testObj);
    }
};

var actionHistory = proxyquire("../lib/action-history", { "./database-ops": databaseOpsStub });

describe("action history", function() {
    describe("writeActionHistoryEntry", function() {
        it("should write an action history entry with all the required information", function(done) {
            var testData = {
                type: "UPLOAD_IMAGE",
                item: "ImageID",
                username: "si_user",
                ipAddress: "127.0.0.1",
                info: {
                    request_url: "upload",
                    author: "si_user"
                }
            };
            actionHistory.writeActionHistory(testData, function (err, result) {
                if (err) {
                    assert.fail(err);
                    done();
                    return;
                }
                assert.ifError(err);
                assert.ok(result);
                assert.equal(result.type, testData.type);
                assert.equal(result.item, testData.item);
                assert.equal(result.username, testData.username);
                assert.equal(result.ip_address, testData.ipAddress);
                assert.equal(result.info, testData.info);
                done();
            });
        });

        it("should produce an error if required information for an action history is not provided", function(done) {
            assert.fail("Not implemented");
        });

        it("should provide an error if undefined is passed as any of the arguments", function(done) {
            assert.fail("Not implemented");
        });
    });
});