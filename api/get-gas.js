const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
        const url = 'https://www.opinet.co.kr/api/detailById.do?code=F260409864&id=A0027320&out=xml';
        const response = await axios.get(url);
        
        const parser = new XMLParser();
        const json = parser.parse(response.data);
        
        // 데이터가 들어있는 핵심 경로 (RESULT -> OIL)
        const root = json.RESULT && json.RESULT.OIL;
        
        // 데이터가 한 개일 수도, 여러 개(배열)일 수도 있어서 처리
        const item = Array.isArray(root) ? root[0] : root;

        if (!item) {
            return res.json({ name: "주유소 정보를 찾을 수 없음", price: "0", date: "-" });
        }

        // 오피넷의 실제 필드명에 맞춰 추출
        res.json({
            name: item.OS_NM || "이름없음",
            price: item.PRICE || "0",
            date: String(item.UPDT_DT || "-")
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
