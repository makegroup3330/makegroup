# MAKE GROUP — Wix 원본 디자인 이전본

원본: https://ma3371739.wixsite.com/makegroup
대상: makegroup3330/makegroup (새 저장소)
기존 plhomepage는 변경하지 않습니다. PL의 디자인·콘텐츠를 참조하지 않았습니다.

## 구성
Wix 원본의 로고·색상·서체·반투명 메뉴·구획·이미지 배치를 유지한 정적 페이지입니다. 메인 슬라이드 8개(이미지 6장·영상 2개), 메인 포트폴리오 이미지 110장, Architecture Graphics, Project 목록 및 사이트맵의 글 37개, Contact, Guidelines, Payment를 포함합니다. Project 하단 선택 메뉴로 모든 글에 접근할 수 있습니다.

## 서비스 차이
Wix 광고는 제거했습니다. Wix 서버의 채팅은 이메일 문의 링크로 대체했습니다. SEND는 이메일 앱을 열며, 서버로 직접 접수하지 않습니다. Wix 댓글·좋아요·조회수 집계, 로그인과 결제 처리 기능은 이전되지 않습니다. Payment의 결제 안내 내용은 원본을 유지했습니다. 원본의 공개 화면과 비교해 데스크톱 화면, 슬라이드·이미지 확대·글 상세·로컬 링크를 확인했습니다. 모바일 전용 Wix 레이아웃의 동일성은 별도 검증이 필요합니다.

## 게시
새 GitHub 저장소 makegroup을 만들고 이 폴더 전체(.nojekyll 포함)를 루트에 올립니다. Settings → Pages → Deploy from a branch → main / (root). CNAME은 makegroup.co.kr로 준비되어 있습니다. 도메인 전환 전 github.io 주소만 점검하려면 CNAME을 잠시 제외하고, 전환 시 Pages Custom domain에 makegroup.co.kr을 등록합니다.

## 도메인 연결
현재 DNS는 Wix 네임서버입니다. 블루웹은 도메인 등록 업체이며 실제 레코드 수정은 현재 권한 DNS 관리 화면에서 해야 합니다. Pages 도메인 등록 후 @ A를 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153으로 설정하고, www CNAME을 makegroup3330.github.io로 설정합니다. 이메일용 MX/TXT는 보존합니다. DNS 정상 반영 후 Pages에서 HTTPS를 활성화합니다.

## 백업
별도 plhomepage-backup-2026-10-15.zip은 기존 PL 저장소 커밋 e9ee43045609204c8d748ed1d31ac450df0634f9의 파일 백업입니다. Git 이력은 원격 plhomepage 저장소에 그대로 남아 있습니다.
