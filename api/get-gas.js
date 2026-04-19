const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

module.exports = async (req, res) => {
    // 브라우저 접속 허용(CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        const opinetUrl = 'https://www.opinet.co.kr/api/detailById.do?code=F260409864&id=A0027320&out=xml';
        const response = await axios.get(opinetUrl);
        
        const parser = new XMLParser();
        const result = parser.parse(response.data);
        
        // 오피넷 XML 구조에서 필요한 데이터 추출
        const oilInfo = result.RESULT.OIL;
        
        // 경유(D047) 가격 찾기 (보통 리스트 형태로 오므로 찾기가 필요함)
        // 만약 리스트가 아니라 단일 객체라면 바로 접근
        const gasStationName = oilInfo[0]?.OS_NM || oilInfo.OS_NM;
        const updateDate = oilInfo[0]?.UPDT_DT || oilInfo.UPDT_DT;
        
        // 경유 가격 추출 (제품구분 D047이 경유)
        let dieselPrice = "정보 없음";
        if (Array.isArray(oilInfo)) {
            const dieselData = oilInfo.find(item => item.PRODCD === 'D047');
            if (dieselData) dieselPrice = dieselData.PRICE;
        } else if (oilInfo.PRODCD === 'D047') {
            dieselPrice = oilInfo.PRICE;
        }

        res.status(200).json({
            name: gasStationName,
            price: dieselPrice,
            date: updateDate
        });
    } catch (error) {
        res.status(500).json({ error: '데이터 추출 실패', detail: error.message });
    }
};
