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

    # Sincroniza a raiz do projeto para troca de chaves SSH com a VM2
    vm1.vm.synced_folder ".", "/vagrant_data"

    vm1.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y software-properties-common
      add-apt-repository --yes --update ppa:ansible/ansible
      apt-get install -y ansible

      echo "Ansible instalado:"
      ansible --version

      # Gera par de chaves SSH para o usuário vagrant
      # A chave pública é compartilhada via pasta sincronizada para que a VM2
      # possa adicioná-la ao seu authorized_keys antes de o playbook rodar
      if [ ! -f /home/vagrant/.ssh/id_rsa ]; then
        sudo -u vagrant ssh-keygen -t rsa -b 2048 \
          -f /home/vagrant/.ssh/id_rsa -N "" -q
        echo "Par de chaves SSH gerado."
      fi

      mkdir -p /vagrant_data/.ssh_exchange
      cp /home/vagrant/.ssh/id_rsa.pub /vagrant_data/.ssh_exchange/vm1.pub
      echo "Chave pública copiada para .ssh_exchange/vm1.pub"
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

      # Adiciona a chave pública da VM1 ao authorized_keys do vagrant
      # Vagrant provisiona as VMs em ordem: VM1 primeiro, depois VM2
      # Por isso a chave já estará disponível em .ssh_exchange/vm1.pub
      if [ -f /vagrant_data/.ssh_exchange/vm1.pub ]; then
        mkdir -p /home/vagrant/.ssh
        cat /vagrant_data/.ssh_exchange/vm1.pub >> /home/vagrant/.ssh/authorized_keys
        chmod 700 /home/vagrant/.ssh
        chmod 600 /home/vagrant/.ssh/authorized_keys
        chown -R vagrant:vagrant /home/vagrant/.ssh
        echo "Chave pública da VM1 adicionada ao authorized_keys."
      else
        echo "AVISO: chave da VM1 não encontrada em .ssh_exchange/vm1.pub"
      fi

      echo "Provisionamento concluído!"
    SHELL

  end

end
