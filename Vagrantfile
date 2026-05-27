# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # ─────────────────────────────────────────────────────────────────────────
  # VM1 — Nó de controle Ansible
  # ─────────────────────────────────────────────────────────────────────────
  config.vm.define "vm1" do |vm1|

    vm1.vm.box      = "ubuntu/jammy64"
    vm1.vm.hostname = "vm1"
    vm1.vm.network "private_network", ip: "192.168.56.10"

    vm1.vm.provider "virtualbox" do |vb|
      vb.name   = "forum-anonimo-vm1"
      vb.memory = 1024
      vb.cpus   = 1
    end

    # Sincroniza a pasta ansible/ com /ansible dentro da VM1
    vm1.vm.synced_folder "./ansible", "/ansible"

    # Provisionamento — instala o Ansible na VM1
    vm1.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y software-properties-common
      add-apt-repository --yes --update ppa:ansible/ansible
      apt-get install -y ansible

      echo "Ansible instalado:"
      ansible --version
    SHELL

  end

  # ─────────────────────────────────────────────────────────────────────────
  # VM2 — Nó gerenciado
  # ─────────────────────────────────────────────────────────────────────────
  config.vm.define "vm2" do |vm2|

    vm2.vm.box      = "ubuntu/jammy64"
    vm2.vm.hostname = "vm2"
    vm2.vm.network "private_network", ip: "192.168.56.11"
    vm2.vm.synced_folder ".", "/vagrant_data"

    vm2.vm.provider "virtualbox" do |vb|
      vb.name   = "forum-anonimo-vm2"
      vb.memory = 512
      vb.cpus   = 1
    end

    vm2.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y curl gnupg
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      apt-get install -y nodejs

      echo "Node.js: $(node --version)"
      echo "npm: $(npm --version)"

      cd /vagrant_data
      npm install --omit=dev

      echo "Provisionamento concluído!"
    SHELL

  end

end