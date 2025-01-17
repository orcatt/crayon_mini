var utils = require('../../../../../api/util.js');

Component({
	properties: {
	},
	data: {
		provinces: [],
		cities: [],
		districts: [],
		selectedProvince: null,
		selectedCity: null,
		selectedDistrict: null,
		locationResult: null,
		licenseList: null
	},
	methods: {
		getProvinces() {
			var that = this;
			utils.getData({
        url: 'explore/location/provinces',
        params: '',
				method: 'GET',
        success: function (res) {
          if (res.code == 200) {
						that.setData({
							provinces: res.data
						})

          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
		},
		onProvinceChange(e) {
			var that = this;
			const index = e.detail.value;
			const province = this.data.provinces[index];
			
			this.setData({
				selectedProvince: province,
				selectedCity: null,
				selectedDistrict: null,
				cities: province.cities || [],
				districts: [],
				locationResult: null,
				licenseList: province.license || []
			});

			utils.getData({
        url: 'explore/location/cities',
        params: {
					province_id: province.province_id
				},
				method: 'GET',
        success: function (res) {
          if (res.code == 200) {
						console.log(res.data);
						that.setData({
							cities: res.data
						})

          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
		},
		onCityChange(e) {
			var that = this;
			const index = e.detail.value;
			const city = this.data.cities[index];
			
			that.setData({
				selectedCity: city,
				selectedDistrict: null,
				districts: city.districts || [],
				locationResult: null
			});

			utils.getData({
        url: 'explore/location/districts',
        params: {
					city_id: city.city_id
				},
				method: 'GET',
        success: function (res) {
					if (res.code == 200) {
						that.setData({
							districts: res.data
						})

          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
				}
      })
		},
		onDistrictChange(e) {
			const index = e.detail.value;
			const district = this.data.districts[index];
			console.log(this.data.selectedProvince, this.data.selectedCity, district);
			
			this.setData({
				selectedDistrict: district,
				locationResult: {
					province: this.data.selectedProvince.name,
					province_char: this.data.selectedProvince.province_char,
					city: this.data.selectedCity.name,
					code: this.data.selectedCity.code,

					district: district.name,
					zip_code: district.zip_code
				}
			});
		}
	},
	lifetimes: {
		attached: function () {
			this.getProvinces();
		}
	}
});