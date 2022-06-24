import should from "should";
import ResourceMethod from "../src/resource-method.cjs"

typeof describe === "function" &&
  describe("resource-method", function() {
    it("default ctor()", async()=>{
      let eCaught;
      try {
        let rm = new ResourceMethod();
        rm.handler();
      } catch(e) {
        eCaught = e;
      }
      should(eCaught.message).match(/expected: name/);
    })

    class MockResponse {
      constructor(data, code, type) {
        this.mockData = data;
        this.mockCode = code;
        this.mockType = type;
      }

      send(data) { this.mockData = data; }
      status(code) { this.mockCode = code; }
      type(t) { this.mockType = t; }
    }

    it("custom ctor()", async()=>{
      let name = 'testName';
      let method = 'testMethod';
      let mime = 'testMime';
      let testResponse = {hello: 'testHandler'};
      let handler = (req, res, next)=>testResponse;

      { // all custom
        let rm = new ResourceMethod(method, name, handler, mime);
        should(rm).properties({name, method, mime, handler});
        should(rm.handler()).equal(testResponse);
      }

      { // mime is optional
        let mime = "application/json";
        let rm = new ResourceMethod(method, name, handler, );
        should(rm).properties({name, method, mime, handler});
        should(rm.handler()).equal(testResponse);
      }
    })
    it("TESTTESTprocessRequest() => HTTP response", async() => {
      let testResponse = {testProcessRequest: 'OK'};
      let method = "get";
      let mime = "application/json";
      let name = "testResponse";
      let handler = (req, res) => testResponse;
      let rm = new ResourceMethod(method, name, handler, mime);
      let req = {};
      let res = new MockResponse();
      await rm.processRequest(req,res);
      should.deepEqual(res, new MockResponse(testResponse, 200, mime));
    })
  });
