import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';


class HomeMainForm extends Component {

    componentWillMount(){
       
    }

    componentDidMount() {
       
    }
    
    componentDidMount() {
        // console.log(this)
    }

    componentDidUpdate() {
        // console.log(this)
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        // console.log(this)
    }


    render() {
        const self = this;
        return (
        <form class="propertykey-form">
          <div class="input-group">
            <div class="searchformSec">
              <input type="hidden" name="country" value="ireland"/>
              <div class="profile-text">
                <div class="rd-details">
                  <span>I am looking for an</span>
                  <label class="account-type-label" for="rd1">
                    <input autocomplete="on" class="account-type-radio propertyType" id="rd1" name="propertyType" value="apartment" type="radio" checked>
                    Apartment
                  </label>
                  <label class="account-type-label">
                    <input autocomplete="on" class="account-type-radio propertyType" name="propertyType" value="house" type="radio">
                    House
                  </label>
                  <label class="account-type-label">
                    <input autocomplete="on" class="account-type-radio propertyType" name="propertyType" value="student" type="radio">
                    Student Accommodation
                  </label>
                  <label class="account-type-label">
                    <input autocomplete="on" class="account-type-radio propertyType" name="propertyType" value="share" type="radio">
                    Share
                  </label>
                  <label class="account-type-label">
                    <input autocomplete="on" class="account-type-radio propertyType" name="propertyType" value="holidayhomes" type="radio">
                    Holiday Homes
                  </label>
                  
                </div>
                
                { self.props.showFilters ?
                <div class="signin-form">
                  <div class="frm-group clearfix">
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="countySelected" class="countySelected">
                        <option value="" selected>Choose City/County</option>
                        <option value="" selected>All</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="areaSelected" class="areaSelected">
                        <option value="" selected>Choose Area</option>
                        <option value="" selected>All</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="maxRent" class="maxRent">
                        <option value="" selected>Max Rent</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <input autocomplete="on" type="text" class="form-control propertykey" name="propertykey" placeholder="Property KEY">
                    </div>
                    <div class="styled-input">
                      <span class="input-group-btn" style="z-index: 0;">
                        <button class="btn green-btn" type="submit">Find</button>
                      </span>
                    </div>
                  </div>
                </div>
                : ""}
                <div class="signin-form">
                  <div class="frm-group clearfix">
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="countySelected" required="" class="countySelected">
                        <option value="">Choose City/County</option>
                        {{#each counties}}
                        <option value="{{value}}" {{selected}}>{{label}}</option>
                        {{/each}}
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select slct-main">
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Choose Area</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <label>All Property Type</label>
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">All Property Type</option>
                        <option value="Adamstown">1200</option>
                        <option value="Arbour Hill">1300</option>
                        <option value="Ard Na Greine">1400</option>
                        <option value="Artane">1500</option>
                        <option value="Ashington">1600</option>
                        <option value="Ashtown">1700</option>
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Min Rent</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Max Rent</option>
                        TODO
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <label>Min Beds</label>
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Min Bads</option>
                        <option value="Adamstown">1 Beds</option>
                        <option value="Arbour Hill">2 Beds</option>
                        <option value="Ard Na Greine">3 Beds</option>
                        <option value="Artane">4 Beds</option>
                        <option value="Ashington">5 Beds</option>
                        <option value="Ashtown">6 Beds</option>
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <label>Max Beds</label>
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Max Bads</option>
                        <option value="Adamstown">1 Beds</option>
                        <option value="Arbour Hill">2 Beds</option>
                        <option value="Ard Na Greine">3 Beds</option>
                        <option value="Artane">4 Beds</option>
                        <option value="Ashington">5 Beds</option>
                        <option value="Ashtown">6 Beds</option>
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input styled-input-select">
                      <label>Max Size</label>
                      <select autocomplete="on" name="address.area" required="" class="">
                        <option value="">Max Size</option>
                        <option value="Adamstown">1 Beds</option>
                        <option value="Arbour Hill">2 Beds</option>
                        <option value="Ard Na Greine">3 Beds</option>
                        <option value="Artane">4 Beds</option>
                        <option value="Ashington">5 Beds</option>
                        <option value="Ashtown">6 Beds</option>
                      </select>
                      <span></span>
                    </div>
                    <div class="styled-input">
                      <span class="input-group-btn" style="z-index: 0;">
                        <button class="btn green-btn" type="submit">Find!</button>
                      </span>
                    </div>
                  </div>
                </div>
                {{/unless}}
              </div>
            </div>
          </div>
        </form>
        );
    }
};


export default withTracker(() => {
  return {
    currentUserId: Meteor.userId()
  };
})(HomeMainForm);

