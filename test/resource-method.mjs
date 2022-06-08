import should from "should";
import ResourceMethod from "../src/resource-method.js"

typeof describe === "function" &&
  describe("resource-method", function() {
    it("default ctor()", async()=>{
      let rm = new ResourceMethod();
      should(rm).properties({
        method: 'get',
        mime: 'application/json',
        name: undefined,
      });
      let eCaught;
      try {
        rm.handler();
      } catch(e) {
        eCaught = e;
      }
      should(eCaught).properties({message: "HTTP500 not implemented"});
    })
    it("custom ctor()", async()=>{
      let name = 'testName';
      let method = 'testMethod';
      let mime = 'testMime';
      let testResponse = {hello: 'testHandler'};
      let handler = (req, res, next)=>testResponse;
      let rm = new ResourceMethod(method, name, handler, mime);
      should(rm).properties({name, method, mime});
      should(rm.handler()).equal(testResponse);
    })
  });
