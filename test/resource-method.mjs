import should from "should";
import ResourceMethod from "../src/resource-method.cjs"

typeof describe === "function" &&
  describe("resource-method", function() {
    it("TESTTESTdefault ctor()", async()=>{
      let eCaught;
      try {
        let rm = new ResourceMethod();
        rm.handler();
      } catch(e) {
        eCaught = e;
      }
      should(eCaught.message).match(/expected: name/);
    })
    it("TESTTESTcustom ctor()", async()=>{
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
  });
