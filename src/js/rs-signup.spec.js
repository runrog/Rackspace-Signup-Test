describe('jquery plugin', () => {

  beforeEach(() => {
    $.fn.rsSignUp();
  });

  it('should show plugin methods as defined', () => {
    expect($.fn.rsSignUp).to.not.be.undefined;
    expect($.fn.rsSignUp.test.checkRequired).to.not.be.undefined;
    expect($.fn.rsSignUp.test.checkMinVal).to.not.be.undefined;
    expect($.fn.rsSignUp.test.checkMaxVal).to.not.be.undefined;
    expect($.fn.rsSignUp.test.confirmPassword).to.not.be.undefined;
    expect($.fn.rsSignUp.test.checkType).to.not.be.undefined;
    expect($.fn.rsSignUp.test.convertToDollars).to.not.be.undefined;
  });

  it('should not be empty', () => {
    /**
    @param {string} - input value
    */
    expect($.fn.rsSignUp.test.checkRequired('somevalue').passed).to.equal(true);
  });

  it('should be greater than or equal to minimum', () => {
    /**
    @param {number} - first param is the input value
    @param {number} - second param is the minimum number to compare first to
    */
    expect($.fn.rsSignUp.test.checkMinVal(5, 4).passed).to.equal(true);
  });

  it('should be less than or equal to maximum', () => {
    /**
    @param {number} - first param is the input value
    @param {number} - second param is the maximum number to compare first to
    */
    expect($.fn.rsSignUp.test.checkMaxVal(3, 4).passed).to.equal(true);
  });

  it('should be an equal string value', () => {
    /**
    @param {string} - first param is the password input value
    @param {string} - second param is the password to compare the first to
    */
    expect($.fn.rsSignUp.test.confirmPassword('password', 'password').passed).to.equal(true);
  });

  it('should be a valid email type', () => {
    /**
    @param {string} - email address
    @param {string} - type of format to validate
    */
    expect($.fn.rsSignUp.test.checkType('email@domain.com', 'email').passed).to.have.lengthOf(1);
  });

  it('should be a valid creditcard', () => {
    /**
    @param {string} - credit card number
    @param {string} - type of format to validate
    */
    expect($.fn.rsSignUp.test.checkType('5555 5555 5555 4444', 'creditcard').passed).to.have.lengthOf(1);
  });

  it('should be a valid cvv number', () => {
    /**
    @param {string} - credit card cvv number
    @param {string} - type of format to validate
    */
    expect($.fn.rsSignUp.test.checkType('123', 'cvv').passed).to.have.lengthOf(1);
  });

  it('should be a valid date format', () => {
    /**
    @param {string} - date in 99 / 99 format
    @param {string} - type of format to validate
    */
    expect($.fn.rsSignUp.test.checkType('12 / 12', 'date').passed).to.have.lengthOf(1);
  });

  it('should convert pennies to dollars', () => {
    /**
    @param {number} - amount in pennies
    */
    expect($.fn.rsSignUp.test.convertToDollars(500)).to.equal('5');
  });
});
