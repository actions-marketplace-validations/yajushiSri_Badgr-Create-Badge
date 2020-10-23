# Badgr-Create-Badge
The Badgr Create Badge action uses the label on the pull requests to automate the creation of badges.

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