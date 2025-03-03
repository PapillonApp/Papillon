# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env

let secrets = import ./secrets.nix;
in
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_latest
    pkgs.jre
    pkgs.bun
  ];

  # Sets environment variables in the workspace
  env = pkgs.lib.recursiveUpdate {} secrets;
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "dbaeumer.vscode-eslint"
      "expo.vscode-expo-tools"
      "SonarSource.sonarlint-vscode"
    ];

    # Enable previews
    previews = {
      enable = false;
    };

    # Workspace lifecycle hooks
    workspace = {
      onStart = {
        # install JS dependencies from NPM
        npm-install = "npm ci";
        configure-git = "git config --global user.email $GIT_MAIL && git config --global user.name $GIT_USER";
        install-tunnel-package = "npm i --save-dev @expo/ngrok@^4.1.0"; # Attention à ne pas l'inclure dans les commits git
      };
    };
  };
}
