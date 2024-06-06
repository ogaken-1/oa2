{
  description = "Dev environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        inherit (nixpkgs.lib) optional;
        pkgs = import nixpkgs { inherit system; };

        nodejs = pkgs.nodejs_22;
        corepack = pkgs.stdenv.mkDerivation {
          name = "corepack";
          buildInputs = [ nodejs ];
          phases = [ "installPhase" ];
          installPhase = ''
            mkdir -p $out/bin
            corepack enable --install-directory=$out/bin
          '';
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            nodejs
            corepack
            pkgs.prettierd
            pkgs.rustup
            pkgs.sqldef
            pkgs.openapi-generator-cli
          ];
        };
      }
    );
}
