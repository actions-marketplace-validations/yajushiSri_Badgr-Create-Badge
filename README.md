# Badgr-Create-Badge
The Badgr Create Badge action uses the label on the pull requests to automate the creation of badges.
The action uses label to match the available badges for the specified user.
Add a label to the pull request/issue. For example, create a label neophyte for a badge named THE NEOPHYTE
## Usage
```yaml
    steps:
        - name: Badgr Create Badge
          uses: yajushiSri/Badgr-Create-Badge@1.0.0
          id: badge
          with:
            github-token: ${{secrets.GITHUB_TOKEN}}
            repo: ${{github.repository}}
            sha: ${{github.sha}}
    # Add BADGR credentials in repository's secrets        
            username: ${{secrets.BADGR_USERNAME}}
            password: ${{secrets.BADGR_PASSWORD}}
```

Example workflow for asserting a badge on pull request event which is merged and labeled.
```yaml
name: Badgr Actions

on:
  pull_request:
    types: [closed, labeled]

jobs: 
  action:
    runs-on: ubuntu-latest
    steps:
      - name: Actions
        uses: actions/checkout@v2

      - name: Badgr Create Badge
        if: ${{ github.event.pull_request.merged == true }}
        uses: yajushiSri/Badgr-Create-Badge@1.0.1
        id: badge
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          repo: ${{github.repository}}
          sha: ${{github.sha}}
          username: ${{secrets.BADGR_USERNAME}}
          password: ${{secrets.BADGR_PASSWORD}}
```
