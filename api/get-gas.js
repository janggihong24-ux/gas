const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

module.exports = async (req, res) => {
    // 브라우저 접속 허용(CORS) 및 한글 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        // 질문하신 전체 주소를 여기에 정확히 넣었습니다.
        const opinetUrl = 'https://www.opinet.co.kr/api/detailById.do?code=F260409864&id=A0027320&out=xml';
        
        const response = await axios.get(opinetUrl);
        const parser = new XMLParser();
        const jsonObj = parser.parse(response.data);
        
        // 오피넷 XML 데이터 구조: RESULT > OIL (보통 배열 형태)
        const oilInfo = jsonObj.RESULT?.OIL;
        
        if (!oilInfo) {
            return res.status(200).json({ name: "데이터 없음", price: "0", date: "-" });
        }

        let targetData = {};

        // 데이터가 배열이면 경유(D047)를 찾고, 아니면 단일 객체 사용
        if (Array.isArray(oilInfo)) {
            targetData = oilInfo.find(item => item.PRODCD === 'D047') || oilInfo[0];
        } else {
            targetData = oilInfo;
        }

        // 화면에 전달할 최종 데이터
        res.status(200).json({
            name: targetData.OS_NM || "주유소명 없음",
            price: targetData.PRICE || 0,
            date: String(targetData.UPDT_DT || "-")
        });

    } catch (error) {
        res.status(500).json({ error: '서버 에러 발생', detail: error.message });
    }
};
