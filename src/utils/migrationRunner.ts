
import { supabase } from '@/integrations/supabase/client';

export const runOrganizationsMigration = async () => {
  console.log('🔧 Executando migração das políticas RLS...');
  
  try {
    // Desabilitar RLS temporariamente
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;'
    });
    
    // Remover políticas antigas
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;
        DROP POLICY IF EXISTS "Enable read access for organization members" ON public.organizations;
        DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.organizations;
      `
    });
    
    // Criar novas políticas permissivas
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow organization creation" ON public.organizations
          FOR INSERT 
          TO authenticated 
          WITH CHECK (true);
        
        CREATE POLICY "Allow organization read" ON public.organizations
          FOR SELECT 
          TO authenticated
          USING (true);
        
        CREATE POLICY "Allow organization update" ON public.organizations
          FOR UPDATE 
          TO authenticated
          USING (true);
      `
    });
    
    // Reabilitar RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;'
    });
    
    console.log('✅ Migração executada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return false;
  }
};
