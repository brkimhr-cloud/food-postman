# 푸드집배원

순수 HTML, CSS, JavaScript로 만든 식자재 수입·유통 브랜드 홈페이지 시안입니다.

## 수정할 곳

- `products.json`: 제품명, 설명, 사진, 문의·구매 링크
- `posts.json`: 이야기(블로그) 글 목록과 본문
- `contact.html`: 실제 연락처와 문의 폼 연동 정보
- 각 HTML 파일: 브랜드 소개와 문구

정적 파일이므로 GitHub Pages 또는 Vercel에서 별도 빌드 설정 없이 배포할 수 있습니다.

## 제품 등록 안내

products.json의 각 항목에서 다음 정보를 편집하면 홈과 제품 목록에 반영됩니다.
- id: 중복 없는 식별자
- status: 준비 중은 pending, 실제 제품은 ready
- name, brand, category, description: 제품명, 브랜드, 분류, 소개
- features: 주요 특징을 문자열 배열로 입력
- usage: 적합한 고객·메뉴·사용 방법
- price: 원 단위 숫자 또는 표시 문구. 모르면 null (가격 문의)
- image: 사진 URL. 비워두면 이미지 준비 중 화면
- purchaseUrl: 실제 구매 URL. 없으면 빈 문자열. pending 상태에서는 구매 버튼을 숨깁니다.
- inquiryUrl: 문의 페이지 주소
- featured: true인 제품을 순서대로 최대 3개 홈에 표시

카테고리 필터와 제품 개수도 데이터에서 자동 생성됩니다. 세 개의 준비 중 카드는 실제 제품 자료로 교체하세요. 토탈푸드 코리아와의 사업적 관계는 표시하지 않습니다.
문의 폼은 현재 시안으로 실제 발송 기능이 연결되어 있지 않습니다.
