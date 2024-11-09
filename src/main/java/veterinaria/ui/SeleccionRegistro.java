package veterinaria.ui;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class SeleccionRegistro extends JFrame {

    private JButton btnRegistrarCliente;
    private JButton btnAgregarMascotaExistente;

    public SeleccionRegistro() {
        setTitle("Seleccionar Acción de Registro");
        setSize(300, 200);
        setLocationRelativeTo(null);
        setLayout(null);

        // Botón para registrar un nuevo cliente
        btnRegistrarCliente = new JButton("Registrar Cliente");
        btnRegistrarCliente.setBounds(50, 30, 200, 40);
        add(btnRegistrarCliente);

        // Botón para añadir mascota a cliente existente
        btnAgregarMascotaExistente = new JButton("Añadir Mascota a Cliente Existente");
        btnAgregarMascotaExistente.setBounds(50, 90, 200, 40);
        add(btnAgregarMascotaExistente);

        // Acción para el botón de Registrar Cliente
        btnRegistrarCliente.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirRegistroCliente();
            }
        });

        // Acción para el botón de Añadir Mascota a Cliente Existente
        btnAgregarMascotaExistente.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirBuscarCliente();
            }
        });
    }

    private void abrirRegistroCliente() {
        // Abre la ventana de registro de cliente
        RegistroCliente registroCliente = new RegistroCliente();
        registroCliente.setVisible(true);
        dispose(); // Cierra la ventana de selección
    }

    private void abrirBuscarCliente() {
        // Abre la ventana de búsqueda de cliente para añadir mascota
        BuscarCliente buscarCliente = new BuscarCliente();
        buscarCliente.setVisible(true);
        dispose(); // Cierra la ventana de selección
    }
}
