import { calendar } from '../../utils/calendar'

Component({
	properties: {
		value: {
			type: String,
			value: ''
		},
		show: {
			type: Boolean,
			value: false,
			observer(newVal) {
				if (newVal) {
					this.initPicker();
				}
			}
		}
	},
	data: {
		lunarYear: ["1900 庚子", "1901 辛丑", "1902 壬寅", "1903 癸卯", "1904 甲辰", "1905 乙巳", "1906 丙午", "1907 丁未", "1908 戊申", "1909 己酉", "1910 庚戌", "1911 辛亥", "1912 壬子", "1913 癸丑", "1914 甲寅", "1915 乙卯", "1916 丙辰", "1917 丁巳", "1918 戊午", "1919 己未", "1920 庚申", "1921 辛酉", "1922 壬戌", "1923 癸亥", "1924 甲子", "1925 乙丑", "1926 丙寅", "1927 丁卯", "1928 戊辰", "1929 己巳", "1930 庚午", "1931 辛未", "1932 壬申", "1933 癸酉", "1934 甲戌", "1935 乙亥", "1936 丙子", "1937 丁丑", "1938 戊寅", "1939 己卯", "1940 庚辰", "1941 辛巳", "1942 壬午", "1943 癸未", "1944 甲申", "1945 乙酉", "1946 丙戌", "1947 丁亥", "1948 戊子", "1949 己丑", "1950 庚寅", "1951 辛卯", "1952 壬辰", "1953 癸巳", "1954 甲午", "1955 乙未", "1956 丙申", "1957 丁酉", "1958 戊戌", "1959 己亥", "1960 庚子", "1961 辛丑", "1962 壬寅", "1963 癸卯", "1964 甲辰", "1965 乙巳", "1966 丙午", "1967 丁未", "1968 戊申", "1969 己酉", "1970 庚戌", "1971 辛亥", "1972 壬子", "1973 癸丑", "1974 甲寅", "1975 乙卯", "1976 丙辰", "1977 丁巳", "1978 戊午", "1979 己未", "1980 庚申", "1981 辛酉", "1982 壬戌", "1983 癸亥", "1984 甲子", "1985 乙丑", "1986 丙寅", "1987 丁卯", "1988 戊辰", "1989 己巳", "1990 庚午", "1991 辛未", "1992 壬申", "1993 癸酉", "1994 甲戌", "1995 乙亥", "1996 丙子", "1997 丁丑", "1998 戊寅", "1999 己卯", "2000 庚辰", "2001 辛巳", "2002 壬午", "2003 癸未", "2004 甲申", "2005 乙酉", "2006 丙戌", "2007 丁亥", "2008 戊子", "2009 己丑", "2010 庚寅", "2011 辛卯", "2012 壬辰", "2013 癸巳", "2014 甲午", "2015 乙未", "2016 丙申", "2017 丁酉", "2018 戊戌", "2019 己亥", "2020 庚子", "2021 辛丑", "2022 壬寅", "2023 癸卯", "2024 甲辰", "2025 乙巳", "2026 丙午", "2027 丁未", "2028 戊申", "2029 己酉", "2030 庚戌", "2031 辛亥", "2032 壬子", "2033 癸丑", "2034 甲寅", "2035 乙卯", "2036 丙辰", "2037 丁巳", "2038 戊午", "2039 己未", "2040 庚申", "2041 辛酉", "2042 壬戌", "2043 癸亥", "2044 甲子", "2045 乙丑", "2046 丙寅", "2047 丁卯", "2048 戊辰", "2049 己巳", "2050 庚午", "2051 辛未", "2052 壬申", "2053 癸酉", "2054 甲戌", "2055 乙亥", "2056 丙子", "2057 丁丑", "2058 戊寅", "2059 己卯", "2060 庚辰", "2061 辛巳", "2062 壬午", "2063 癸未", "2064 甲申", "2065 乙酉", "2066 丙戌", "2067 丁亥", "2068 戊子", "2069 己丑", "2070 庚寅", "2071 辛卯", "2072 壬辰", "2073 癸巳", "2074 甲午", "2075 乙未", "2076 丙申", "2077 丁酉", "2078 戊戌", "2079 己亥", "2080 庚子", "2081 辛丑", "2082 壬寅", "2083 癸卯", "2084 甲辰", "2085 乙巳", "2086 丙午", "2087 丁未", "2088 戊申", "2089 己酉", "2090 庚戌", "2091 辛亥", "2092 壬子", "2093 癸丑", "2094 甲寅", "2095 乙卯", "2096 丙辰", "2097 丁巳", "2098 戊午", "2099 己未", "2100 庚申"],
		lunarMonth: [],
		lunarDay: [],
		valueArray: [0, 0, 0],
		selectedDate: null
	},
	methods: {
		handlePickerChange(e) {
			const [yearIndex, monthIndex, dayIndex] = e.detail.value;
			// 1. 获取年
			const yearStr = this.data.lunarYear[yearIndex];
			const year = parseInt(yearStr.slice(0, 4));
			
			// 2. 更新月份数组并获取月
			const months = this.getMonths(year);
			const monthStr = months[monthIndex];
			const isLeap = monthStr.includes('闰');
			const month = this.getMonthNumber(monthStr);
			
			// 3. 更新日期数组并获取日
			const days = this.getDays(year, month, isLeap);
			const day = dayIndex + 1;

			this.setData({
				lunarMonth: months,
				lunarDay: days,
				selectedDate: {
					year,
					month,
					day,
					isLeap
				}
			});
		},

		handleConfirmTap() {
			const { year, month, day, isLeap } = this.data.selectedDate || {};
			if (!year || !month || !day) {
				wx.showToast({
					title: '请选择完整日期',
					icon: 'none'
				});
				return;
			}

			// 获取农历和公历日期
			const solarDate = calendar.lunar2solar(year, month, day, isLeap);
			const { lYear, gzYear, IMonthCn, IDayCn } = solarDate;
			
			this.triggerEvent('confirm', {
				lunar: `${lYear} ${gzYear} ${IMonthCn} ${IDayCn}`,
				solar: `${solarDate.cYear}-${String(solarDate.cMonth).padStart(2, '0')}-${String(solarDate.cDay).padStart(2, '0')}`
			});
			
			this.setData({ show: false });
		},

		handleMaskTap() {
			this.setData({ show: false });
		},

		getMonths(year) {
			const leapMonth = calendar.leapMonth(year);
			const months = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
			if (leapMonth) {
				months.splice(leapMonth, 0, `闰${months[leapMonth - 1]}`);
			}
			return months;
		},

		getDays(year, month, isLeap) {
			const daysCount = isLeap ? calendar.leapDays(year) : calendar.monthDays(year, month);
			return Array.from({length: daysCount}, (_, i) => calendar.toChinaDay(i + 1));
		},

		getMonthNumber(monthStr) {
			const monthMap = {
				'正': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
				'七': 7, '八': 8, '九': 9, '十': 10, '冬': 11, '腊': 12
			};
			const char = monthStr.includes('闰') ? monthStr[1] : monthStr[0];
			return monthMap[char];
		},

		initPicker() {
			console.log('yes', this.data.value);
			
			if (this.data.value) {
				// 有传入值,解析并定位到对应位置
				const [yearStr, _, monthStr, dayStr] = this.data.value.split(' ');
				const year = parseInt(yearStr);
				const months = this.getMonths(year);
				const monthIndex = months.indexOf(monthStr);
				const days = this.getDays(year, this.getMonthNumber(monthStr), monthStr.includes('闰'));
				const dayIndex = days.indexOf(dayStr);

				this.setData({
					lunarMonth: months,
					lunarDay: days,
					valueArray: [
						this.data.lunarYear.indexOf(`${yearStr} ${_}`),
						monthIndex,
						dayIndex
					],
					selectedDate: {
						year,
						month: this.getMonthNumber(monthStr),
						day: dayIndex + 1,
						isLeap: monthStr.includes('闰')
					}
				});
			} else {
				// 没有传入值,使用当前日期
				const date = new Date();
				const lunar = calendar.solar2lunar(
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate()
				);
				
				const months = this.getMonths(lunar.lYear);
				const days = this.getDays(lunar.lYear, lunar.lMonth, lunar.isLeap);

				this.setData({
					lunarMonth: months,
					lunarDay: days,
					valueArray: [
						this.data.lunarYear.indexOf(`${lunar.lYear} ${lunar.gzYear}`),
						months.indexOf(lunar.IMonthCn),
						days.indexOf(lunar.IDayCn)
					],
					selectedDate: {
						year: lunar.lYear,
						month: lunar.lMonth,
						day: lunar.lDay,
						isLeap: lunar.isLeap
					}
				});
			}
		},
	},
	lifetimes: {
		attached() {
			// 移除这里的initPicker调用
		}
	}
})
