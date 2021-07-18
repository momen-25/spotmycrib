/**
 * Created by njanjanam on 28/05/2017.
 */
// import 'chai-jquery';
// import { Meteor } from 'meteor/meteor';
// import { $ } from 'jquery';


describe('Home Page', function () {
    beforeEach(function () {
        browser.url('http://localhost:3000');
        browser.waitForExist('.joinNowBtn',3000);
        // server.call('generateFixtures');
    });
    it('Home page loads & has .propertykey find box', function () {
        const elements = browser.elements('.propertykey');
        assert.equal(elements.value.length, 1);
    });
    it('SingIn popup should not be there by default', function () {
        const elements = browser.elements('.loginForm');
        assert.equal(elements.value.length, 0);
    });
    it('Join now will show SingIn popup', function () {
        browser.click('.joinNowBtn');
        const elements = browser.elements('.loginForm');
        assert.equal(elements.value.length, 1);
    });
    it('Home page title', function () {
        var title = browser.getTitle();   // EXECUTE
        expect(title).to.equal('SpotMyCrib - Safe and easy rentals');
    });
    it('Login form UI - click in SignIn and Forgot button', function () {
        browser.click('.showLoginDialog')
        var elements;
        elements = browser.elements('.login-input-email');
        assert.equal(elements.value.length, 1);//Has Email button

        browser.waitForVisible('[data-event-action=signUp]',2000);
        browser.click('[data-event-action=signUp]');
        elements = browser.elements('.login-input-fullName');
        assert.equal(elements.value.length, 1);//Has Email button

        browser.click('[data-event-action=signIn]');
        elements = browser.elements('.login-input-password');
        assert.equal(elements.value.length, 1);//Has Email button

        browser.click('[data-event-action=forgotPassword]');
        elements = browser.elements('[data-event-action=reset-password]');
        assert.equal(elements.value.length, 1);//Has Email button

        browser.click('[data-event-action=signIn]');

    });
    it('Login should fail for test user', function () {

        browser.click('.showLoginDialog')
        var elements;
        browser.waitForVisible('[data-event-action=signUp]',2000);

        browser.setValue('.login-input-email', 'test@test.com')
        browser.setValue('.login-input-password', 'test123')

        browser.click('[data-event-action=submitSignInForm]');
        browser.waitForVisible('.changePwdAlertMsgs',2000);
        elements = browser.elements('.changePwdAlertMsgs');
        assert.equal(elements.value.length, 1);//Has Email button

        expect(browser.getText('.changePwdAlertMsgs')).to.have.string('User not found');

    });
    it('@watch SignUp should fail validation error', function () {

        browser.click('.showSignupDialog')
        var elements;
        browser.waitForVisible('[data-event-action=signIn]',2000);

        // browser.pause(3000);
        browser.waitForExist('.login-input-fullName',20000);
        browser.setValue('.login-input-fullName', 'test')
        browser.setValue('.login-input-email', 'test@test.com')
        browser.setValue('.login-input-password', 'test123')
        browser.setValue('.login-input-mobile', 'wrong mobile')

        browser.click('[data-event-action=register]');
        browser.waitForVisible('.changePwdAlertMsgs',2000);
        elements = browser.elements('.changePwdAlertMsgs');
        assert.equal(elements.value.length, 1);//Has Email button

        expect(browser.getText('.changePwdAlertMsgs')).to.have.string('Please enter a valid mobile number');

    });
    it('SignUp should fail existing user', function () {

        browser.click('.showLoginDialog')
        var elements;
        browser.waitForVisible('[data-event-action=signUp]',2000);

        browser.setValue('.login-input-email', 'test@test.com')
        browser.setValue('.login-input-password', 'test123')

        browser.click('[data-event-action=submitSignInForm]');
        browser.waitForVisible('.changePwdAlertMsgs',2000);
        elements = browser.elements('.changePwdAlertMsgs');
        assert.equal(elements.value.length, 1);//Has Email button

        expect(browser.getText('.changePwdAlertMsgs')).to.have.string('User not found');

    });
});
