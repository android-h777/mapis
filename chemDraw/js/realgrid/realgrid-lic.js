var realGrid2Lic = '';

$(function(){
	/*
	 * 운영용 라이센스
	 * 사용가능 도메인 apis.kccworld.info,apis.kccworld.co.kr
	 */ 
	if(document.domain.indexOf("apis.kccworld.info") > -1 || document.domain.indexOf("apis.kccworld.co.kr") > -1){
		realGrid2Lic = 'upVcPE+wPOmtLjqyBIh9RoBwWAefaNXUWdW9bu2N+21QY/0nYpKbKtg7EK3PQNLDiugR61dL3pSK8Ea7xKKRwRHM+DzMntOjli0OMTdNeFR5oxsrC+spwgav1yUABQfNlA/h7iJI8fTok6jyelmbk2DjFWFV5dkJkxValpjT3ck=';
	}
	/*
	 * 개발용 라이센스
	 * 사용가능 도메인 70.11.11.167,127.0.0.1,70.17.9.42,70.17.9.79,70.17.9.34,70.17.9.87,localhost,test.kccworld.info,test.kccworld.co.kr,apistest.kccworld.info,apistest.kccworld.co.kr,apistestkcc.momentive.com,mpmapisdev.momentive.com,mpmapisqa.momentive.com,70.11.11.222,70.11.11.223
	 * 만료일 2025-12-31
	 * 만료시 https://service.realgrid.com/ 에서 개발용 라이센스 새로 발급
	 * 계정 : kspark0470 비번 : 암호3480
	 */
	else {
		realGrid2Lic = 'upVcPE+wPOmtLjqyBIh9RkM/nBOseBrflwxYpzGZyYlvcUPycfuHSC0O7luQbsXrJbZmk0I3kOo7z2eqIq1Uh0X+ikgZqqE2D6N5i3JgqzNlsofeHMoIxeAPvUEmzdfp8Ie4XPW1Qc7Evzm9smjiAjhHQgMBwRFrcqOVAzZevuZB5XtWdT1QtOhmvqYr5MgeBktqj+2j5ByDg3mmkPaqd+hmvqYr5MgeiugR61dL3pQSNl9Xk6NFI7iUh6p38Sve4XTHGDHMqxYSNl9Xk6NFI153FrOCGskgeiI5H5O0wq1kohj5llFlDYBWKaIdc/xz7UZRvVCvdspaJXECJt0/HTdR2jCkcOkC7UZRvVCvdsoPZCbXWTkjakwmKFcgAbiT8gX8aWzLdIeOVF3AdWXp2QaSN8D+MO/zVbdsEEqjvck=';
	}
});