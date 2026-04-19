const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        // 주소 전체를 정확히 넣었습니다.
        const url = 'https://www.opinet.co.kr/api/detailById.do?code=F260409864&id=A0027320&out=xml';
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000 // 연결 시간을 조금 더 늘렸습니다.
        });
        
        const parser = new XMLParser();
        const json = parser.parse(response.data);
        const oilInfo = json.RESULT?.OIL;

        if (!oilInfo) {
            return res.json({ name: "데이터 없음", price: "0", date: "-" });
        }

        // 데이터가 배열(여러 개)일 수도 있으니 첫 번째 값을 가져오도록 안전하게 처리
        const item = Array.isArray(oilInfo) ? oilInfo[0] : oilInfo;

        res.json({
            name: item.OS_NM || "주유소명 없음",
            price: item.PRICE || "0",
            date: String(item.UPDT_DT || "-")
        });

    } catch (e) {
        res.status(500).json({ error: "접속 실패", message: e.message });
    }
};
