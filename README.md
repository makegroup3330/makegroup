# MAKE GROUP 운영 안내

- 운영 홈페이지: https://makegroup.co.kr/
- 디자인 개선안 미리보기: https://makegroup.co.kr/preview/
- 프로젝트 목록 미리보기: https://makegroup.co.kr/preview/projects.html

운영 화면은 Wix 원본을 이전한 기존 버전입니다. 개선안은 `preview/`에서 따로 확인할 수 있습니다. 기존 PL 홈페이지 저장소 `plhomepage`는 수정하거나 디자인 참고 자료로 사용하지 않았습니다.

## 개선안 적용 / 기존 화면 복원

GitHub에 `makegroup3330` 계정으로 로그인한 뒤 아래에서 실행합니다.

https://github.com/makegroup3330/makegroup/actions/workflows/site-pages.yml

1. **Run workflow**를 누릅니다. Branch는 `main`을 선택합니다.
2. 실행할 버전을 선택합니다.
   - `keep`: 현재 운영 화면 유지, 미리보기와 함께 다시 게시
   - `apply_design`: 개선안을 운영 홈페이지에 적용
   - `restore_original`: 보관한 기존 화면으로 복원
3. **Run workflow**를 눌러 실행합니다. 초록색 성공 표시가 나온 뒤 홈페이지를 확인합니다.

적용과 복원은 GitHub Pages 배포 시간이 필요하므로 몇 분 걸릴 수 있습니다. 별도 도메인 변경은 필요 없습니다. 미리보기는 계속 유지됩니다. 한 번의 배포가 완료되면 해당 버전의 페이지와 이미지가 함께 교체됩니다.

## 대표 이미지 검증

기존 Wix 프로젝트 37개의 대표 이미지를 원본 게시물의 `og:image` 및 원본 목록 이미지와 대조했습니다. 개선안의 카드 표시 117곳이 같은 원본 이미지를 사용합니다. WebP 변환과 화면 비율에 따른 잘림은 있을 수 있습니다.

## 검색 노출 / 문의

미리보기 페이지에는 `noindex`를 넣고 `robots.txt`에서 `/preview/`를 제외했습니다. 개선안을 운영 화면으로 적용하면 본문 페이지의 검색 허용 설정, 운영 도메인의 canonical과 사이트맵을 함께 적용합니다.

문의 버튼은 이메일 앱을 엽니다. Wix 서버의 댓글·조회수·로그인·결제 처리는 포함되지 않습니다.

## 보관 / 배포 구조

기존 화면 복원 기준 커밋: `d15f45567b7f9194fbad3fa70b8d6e498967dafc`.
`_site_tools/original-ref.txt`에 복원 기준을 보관하며 Git 이력은 그대로 유지합니다. 별도 ZIP 백업도 로컬 전달 폴더에 보관되어 있습니다.

Pages는 GitHub Actions로 게시합니다. `_site_tools/manage_site.py`가 화면 선택, 로컬 링크 검증, 게시 폴더 생성을 수행합니다. 설정 파일과 도구는 게시 폴더에서 제외합니다. 운영 원본 이미지와 미리보기 파일은 복원 후에도 보관합니다.
